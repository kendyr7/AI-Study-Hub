
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { produce } from 'immer';
import { useToast } from '@/hooks/use-toast';
import { updateItemsOrderAction, updateTopicFolderAction } from '@/app/actions';
import type { Folder, Topic } from '@/lib/types';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GripVertical } from 'lucide-react';

import { NewFolderDialog } from './new-folder-dialog';
import { FolderItem, FolderContainer } from './folder-item';
import { TopicItem, TopicCard } from './topic-item';

const UNCAT_FOLDER_ID = 'uncategorized';

type Items = {
  [key: string]: string[] | Topic[];
};

export function TopicsList({ initialTopics, initialFolders }: { initialTopics: Topic[], initialFolders: Folder[] }) {
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const items = useMemo<{ [key: string]: Topic[] | Folder[] }>(() => {
    const groupedTopics: { [key: string]: Topic[] } = { [UNCAT_FOLDER_ID]: [] };
    folders.forEach(folder => {
        groupedTopics[folder.id] = [];
    });

    topics.forEach(topic => {
        const folderId = topic.folderId || UNCAT_FOLDER_ID;
        if (groupedTopics[folderId]) {
            groupedTopics[folderId].push(topic);
        } else {
            groupedTopics[UNCAT_FOLDER_ID].push(topic);
        }
    });
    return {
        root: folders,
        ...groupedTopics,
    };
  }, [topics, folders]);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return topics.find(t => t.id === activeId) || folders.find(f => f.id === activeId);
  }, [activeId, topics, folders]);

  const findContainer = (id: string) => {
    if (folders.find(f => f.id === id)) return 'root';
    for (const folder of folders) {
        if ((items[folder.id] as Topic[]).find((t: Topic) => t.id === id)) {
            return folder.id;
        }
    }
    if ((items[UNCAT_FOLDER_ID] as Topic[]).find((t: Topic) => t.id === id)) {
        return UNCAT_FOLDER_ID;
    }
    return null;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id.toString());
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const overId = over.id.toString();
    const activeId = active.id.toString();
    const activeContainer = findContainer(activeId);
    let overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;
    
    if (folders.some(f => f.id === overId)) {
        overContainer = overId;
    }

    if (activeContainer !== overContainer) {
        setTopics(currentTopics => {
            return produce(currentTopics, draft => {
                const activeIndex = draft.findIndex(t => t.id === activeId);
                if (activeIndex === -1) return;
                
                const newFolderId = overContainer === 'root' || overContainer === UNCAT_FOLDER_ID ? null : overContainer;
                draft[activeIndex].folderId = newFolderId;

                const [movedItem] = draft.splice(activeIndex, 1);
                draft.push(movedItem); 
            });
        });
    }
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
        setActiveId(null);
        return;
    }
    const activeId = active.id.toString();
    const overId = over.id.toString();
    const activeContainer = findContainer(activeId);
    let overContainer = findContainer(overId);

    if (folders.some(f => f.id === overId)) {
      overContainer = overId;
    }

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    const activeIsFolder = folders.some(f => f.id === activeId);

    if (activeIsFolder && activeContainer === 'root' && overContainer === 'root') {
      const oldIndex = folders.findIndex(f => f.id === activeId);
      const newIndex = folders.findIndex(f => f.id === overId);
      const newFolders = arrayMove(folders, oldIndex, newIndex);
      setFolders(newFolders);
      const updatePayload = newFolders.map((f, i) => ({ id: f.id, order: i }));
      await updateItemsOrderAction({ items: updatePayload, type: 'folders' });
    }
    else if (!activeIsFolder) {
      const oldTopics = items[activeContainer] as Topic[];
      const newTopics = items[overContainer] as Topic[];
      const oldIndex = oldTopics.findIndex(t => t.id === activeId);
      const newIndex = overContainer === activeContainer 
        ? newTopics.findIndex(t => t.id === overId)
        : newTopics.length;

      if (activeContainer === overContainer) {
          const reordered = arrayMove(oldTopics, oldIndex, newIndex);
          const newOrderState = produce(topics, draft => {
              reordered.forEach((topic, index) => {
                  const draftTopic = draft.find(t => t.id === topic.id);
                  if (draftTopic) draftTopic.order = index;
              });
          });
          setTopics(newOrderState.sort((a,b) => a.order - b.order));
          await updateItemsOrderAction({ items: reordered.map((t, i) => ({ id: t.id, order: i })), type: 'topics' });
      } else {
          const newFolderId = overContainer === UNCAT_FOLDER_ID ? null : overContainer;
          
          const newTopicsState = produce(topics, draft => {
            const topicToMove = draft.find(t => t.id === activeId)!;
            topicToMove.folderId = newFolderId;
            topicToMove.order = newTopics.length;
          });
          setTopics(newTopicsState);
          await updateTopicFolderAction({ topicId: activeId, newFolderId, newOrder: newTopics.length });

          const remainingTopics = oldTopics.filter(t => t.id !== activeId);
          await updateItemsOrderAction({ items: remainingTopics.map((t, i) => ({ id: t.id, order: i })), type: 'topics' });
      }
    }

    setActiveId(null);
  };

  const onFolderCreated = useCallback((newFolder: Folder) => {
    setFolders(currentFolders => [...currentFolders, newFolder]);
  }, []);

  const handleArchiveTopic = useCallback((topicId: string) => {
    setTopics(currentTopics => currentTopics.filter(t => t.id !== topicId));
  }, []);

  if (topics.length === 0 && folders.length === 0) {
    return (
        <div className="text-center py-10 rounded-2xl border border-dashed border-white/20">
            <p className="text-muted-foreground">You haven't created any topics yet.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/topics/new">Create Your First Topic</Link>
            </Button>
        </div>
    )
  }

  return (
    <>
      <div className="flex justify-end">
        <NewFolderDialog onFolderCreated={onFolderCreated} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <SortableContext items={folders.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <Accordion type="multiple" className="space-y-4">
              {folders.map(folder => (
                <FolderItem key={folder.id} folder={folder} disabled={!isMounted}>
                  <SortableContext items={(items[folder.id] as Topic[]).map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 p-4 pt-0">
                      {(items[folder.id] as Topic[]).map(topic => (
                          <TopicItem key={topic.id} topic={topic} disabled={!isMounted} onArchive={handleArchiveTopic} />
                      ))}
                      {(items[folder.id] as Topic[]).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">Drag topics here to add them to this folder.</p>
                      )}
                    </div>
                  </SortableContext>
                </FolderItem>
              ))}
            </Accordion>
          </SortableContext>

          <FolderContainer id={UNCAT_FOLDER_ID}>
            <h3 className="text-lg font-semibold text-muted-foreground px-4 py-2">Uncategorized</h3>
            <SortableContext items={(items[UNCAT_FOLDER_ID] as Topic[]).map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 p-4 pt-0">
                {(items[UNCAT_FOLDER_ID] as Topic[]).map(topic => (
                    <TopicItem key={topic.id} topic={topic} disabled={!isMounted} onArchive={handleArchiveTopic} />
                ))}
                </div>
            </SortableContext>
          </FolderContainer>
        </div>
        
        {isMounted ? createPortal(
            <DragOverlay dropAnimation={null}>
                {activeItem ? (
                    'name' in activeItem ? 
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-primary shadow-lg">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{activeItem.name}</h3>
                    </div>
                    :
                    <TopicCard topic={activeItem as Topic} isOverlay />
                ) : null}
            </DragOverlay>,
            document.body
        ) : null}
      </DndContext>
    </>
  );
}
