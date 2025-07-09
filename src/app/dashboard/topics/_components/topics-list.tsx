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
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import type { Topic } from '@/lib/types';
import { TopicItem, TopicCard } from './topic-item';

export function TopicsList({ 
    topics, 
    onSelectTopic, 
    onArchive, 
    onOrderChange 
}: { 
    topics: Topic[], 
    onSelectTopic: (id: string) => void,
    onArchive: (id: string) => void,
    onOrderChange: (reorderedTopics: {id: string, order: number}[]) => void
}) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensors = useSensors(useSensor(PointerSensor));

    const activeTopic = useMemo(() => {
        if (!activeId) return null;
        return topics.find(t => t.id === activeId);
    }, [activeId, topics]);

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveId(active.id.toString());
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        
        if (over && active.id !== over.id) {
            const oldIndex = topics.findIndex((t) => t.id === active.id);
            const newIndex = topics.findIndex((t) => t.id === over.id);
            const reordered = arrayMove(topics, oldIndex, newIndex);
            
            onOrderChange(reordered.map((t, i) => ({ id: t.id, order: i })));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={topics.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 p-1">
                    {topics.map(topic => (
                        <TopicItem 
                            key={topic.id} 
                            topic={topic} 
                            disabled={!isMounted} 
                            onArchive={onArchive} 
                            onSelect={onSelectTopic}
                        />
                    ))}
                </div>
            </SortableContext>
            
            {isMounted ? createPortal(
                <DragOverlay dropAnimation={null}>
                    {activeTopic ? (
                        <TopicCard topic={activeTopic} isOverlay />
                    ) : null}
                </DragOverlay>,
                document.body
            ) : null}
        </DndContext>
    );
}
