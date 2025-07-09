'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { produce } from 'immer';
import type { Folder, Topic } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { updateItemsOrderAction } from '@/app/actions';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderPlus, Inbox, PlusCircle, Archive, Folder as FolderIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TopicsList } from './topics-list';
import { TopicDetailView } from './topic-detail-view';
import { NewFolderDialog } from './new-folder-dialog';
import { EditFolderDialog } from './edit-folder-dialog';

const UNCATEGORIZED_ID = 'uncategorized';

function FolderSidebar({ 
    folders, 
    selectedFolderId, 
    onSelectFolder,
    onFolderCreated,
    onFolderUpdated,
    uncategorizedCount,
    getTopicCountForFolder
}: {
    folders: Folder[], 
    selectedFolderId: string | null,
    onSelectFolder: (id: string) => void,
    onFolderCreated: (newFolder: Folder) => void,
    onFolderUpdated: (updatedFolder: Folder) => void,
    uncategorizedCount: number,
    getTopicCountForFolder: (folderId: string) => number,
}) {
    const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

    return (
        <>
            <div className="flex flex-col h-full bg-card/30 p-2">
                <div className="flex items-center justify-between p-2">
                    <h2 className="text-lg font-semibold">Folders</h2>
                    <NewFolderDialog onFolderCreated={onFolderCreated}>
                        <Button variant="ghost" size="icon">
                            <FolderPlus className="h-5 w-5" />
                        </Button>
                    </NewFolderDialog>
                </div>
                <div className="flex-1 mt-2">
                    <ScrollArea>
                        <nav className="flex flex-col gap-1 px-2">
                            <Button
                                variant={selectedFolderId === UNCATEGORIZED_ID ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => onSelectFolder(UNCATEGORIZED_ID)}
                            >
                                <Inbox className="mr-2 h-4 w-4" />
                                <span>Inbox</span>
                                <span className="ml-auto text-xs text-muted-foreground">{uncategorizedCount}</span>
                            </Button>
                            {folders.map(folder => (
                                <div key={folder.id} className="group relative">
                                    <Button
                                        variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => onSelectFolder(folder.id)}
                                    >
                                        <span className="mr-2 h-4 w-4 flex items-center justify-center">
                                            {folder.emoji ? (
                                                <span>{folder.emoji}</span>
                                            ) : (
                                                <FolderIcon style={{color: folder.color}}/>
                                            )}
                                        </span>

                                        <span className="truncate">{folder.name}</span>
                                        <span className="ml-auto text-xs text-muted-foreground">{getTopicCountForFolder(folder.id)}</span>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingFolder(folder);
                                        }}
                                    >
                                        <Settings className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </nav>
                    </ScrollArea>
                </div>
                <div className="p-2 border-t border-white/10">
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/dashboard/archive">
                            <Archive className="mr-2 h-4 w-4" />
                            View Archive
                        </Link>
                    </Button>
                </div>
            </div>
            {editingFolder && (
                <EditFolderDialog 
                    folder={editingFolder}
                    onFolderUpdated={onFolderUpdated}
                    open={!!editingFolder}
                    onOpenChange={(open) => !open && setEditingFolder(null)}
                />
            )}
        </>
    );
}


export function TopicsView({ initialTopics, initialFolders }: { initialTopics: Topic[], initialFolders: Folder[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const [folders, setFolders] = useState<Folder[]>(initialFolders);
    const [topics, setTopics] = useState<Topic[]>(initialTopics);
    
    const selectedFolderId = useMemo(() => searchParams.get('folderId') || UNCATEGORIZED_ID, [searchParams]);
    const selectedTopicId = useMemo(() => searchParams.get('topicId'), [searchParams]);
    
    useEffect(() => {
        // If there's a topicId in the URL on load, but no folderId, find its folder and set it.
        const topicId = searchParams.get('topicId');
        if (topicId && !searchParams.get('folderId')) {
            const topic = topics.find(t => t.id === topicId);
            const folderId = topic?.folderId || UNCATEGORIZED_ID;
            updateQueryParam('folderId', folderId);
        }
    }, []); // Run only on mount

    const updateQueryParam = (key: string, value: string | null) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (value === null) {
            current.delete(key);
        } else {
            current.set(key, value);
        }
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`, { scroll: false });
    };
    
    const onSelectFolder = (folderId: string) => {
        updateQueryParam('folderId', folderId);
        updateQueryParam('topicId', null); // Close topic when changing folder
    };

    const onSelectTopic = (topicId: string) => {
        updateQueryParam('topicId', topicId);
    };
    
    const onTopicClose = () => {
        updateQueryParam('topicId', null);
    };

    const onFolderCreated = (newFolder: Folder) => {
        setFolders(current => [...current, newFolder].sort((a,b) => a.order - b.order));
        onSelectFolder(newFolder.id);
    };

    const onFolderUpdated = (updatedFolder: Folder) => {
        setFolders(current => produce(current, draft => {
            const index = draft.findIndex(f => f.id === updatedFolder.id);
            if (index !== -1) {
                draft[index] = updatedFolder;
            }
        }));
    };

    const handleArchiveTopic = (topicId: string) => {
        if (selectedTopicId === topicId) {
            onTopicClose();
        }
        setTopics(current => current.filter(t => t.id !== topicId));
    };

    const handleTopicUpdate = (updatedTopic: Topic) => {
        setTopics(current => produce(current, draft => {
            const index = draft.findIndex(t => t.id === updatedTopic.id);
            if (index !== -1) {
                draft[index] = updatedTopic;
            }
        }));
    };
    
    const handleOrderChange = async (reorderedItems: {id: string, order: number}[]) => {
        const folderTopics = topics.filter(t => (t.folderId || UNCATEGORIZED_ID) === selectedFolderId);
        const oldOrder = [...folderTopics];

        // Optimistically update UI
        setTopics(current => produce(current, draft => {
            reorderedItems.forEach(item => {
                const topic = draft.find(t => t.id === item.id);
                if (topic) topic.order = item.order;
            });
        }));

        try {
            await updateItemsOrderAction({ items: reorderedItems, type: 'topics' });
        } catch (error) {
            setTopics(oldOrder); // Revert on error
            toast({ title: "Error", description: "Could not update topic order.", variant: 'destructive' });
        }
    };

    const topicsForSelectedFolder = useMemo(() => {
        const currentFolder = selectedFolderId === UNCATEGORIZED_ID ? null : selectedFolderId;
        const filtered = topics.filter(t => t.folderId === currentFolder);
        return filtered.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    }, [selectedFolderId, topics]);

    const getTopicCountForFolder = (folderId: string) => {
        return topics.filter(topic => topic.folderId === folderId).length;
    };

    const uncategorizedCount = useMemo(() => topics.filter(t => !t.folderId).length, [topics]);

    const folderSidebar = (
        <FolderSidebar 
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onFolderCreated={onFolderCreated}
            onFolderUpdated={onFolderUpdated}
            uncategorizedCount={uncategorizedCount}
            getTopicCountForFolder={getTopicCountForFolder}
        />
    );

    const topicListPanel = (
         <div className="flex flex-col h-full p-2">
            <div className="flex items-center justify-between p-2">
                <div>
                     <h1 className="text-xl font-bold tracking-tight font-headline">My Topics</h1>
                    <p className="text-muted-foreground text-sm">Organize your study materials.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/topics/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Topic
                    </Link>
                </Button>
            </div>
            <div className="flex-1 mt-2">
                <ScrollArea>
                    {topicsForSelectedFolder.length > 0 ? (
                        <TopicsList 
                            topics={topicsForSelectedFolder}
                            onSelectTopic={onSelectTopic}
                            onArchive={handleArchiveTopic}
                            onOrderChange={handleOrderChange}
                        />
                    ) : (
                        <div className="text-center py-10 rounded-2xl border border-dashed border-white/20">
                            <p className="text-muted-foreground">This folder is empty.</p>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <div className="h-[calc(100vh-5rem)]">
                {!selectedTopicId ? (
                     <div className={cn(selectedFolderId && "hidden", "sm:hidden")}>
                        {folderSidebar}
                    </div>
                ) : null}

                <div className={cn(!selectedFolderId && "hidden", "sm:block h-full")}>
                    {topicListPanel}
                </div>
                
                <Sheet open={!!selectedTopicId} onOpenChange={(open) => !open && onTopicClose()}>
                    <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l-white/10 bg-background/90 backdrop-blur-xl">
                        {selectedTopicId && <TopicDetailView topicId={selectedTopicId} onClose={onTopicClose} onTopicUpdate={handleTopicUpdate} />}
                    </SheetContent>
                </Sheet>
            </div>
        )
    }

    return (
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-6rem)] rounded-lg border border-white/10">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
               {folderSidebar}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={selectedTopicId ? 45 : 100} minSize={30}>
                        {topicListPanel}
                    </ResizablePanel>
                    {selectedTopicId && (
                        <>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={55} minSize={30}>
                                <TopicDetailView topicId={selectedTopicId} onClose={onTopicClose} onTopicUpdate={handleTopicUpdate}/>
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
