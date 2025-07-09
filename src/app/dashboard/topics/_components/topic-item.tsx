'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { GripVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function TopicCard({ topic, isOverlay = false }: { topic: Topic, isOverlay?: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between w-full p-3 rounded-lg bg-card/80 backdrop-blur-sm",
            isOverlay ? "shadow-lg border border-primary" : "border border-white/10"
        )}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {!isOverlay && (
                    <div className="p-1 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                        <Link href={`/dashboard/topics/${topic.id}`} className="hover:text-primary transition-colors">{topic.title}</Link>
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {topic.tags.map(tag => <Badge key={tag} variant="secondary" className="border border-white/10">{tag}</Badge>)}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
                <p className="text-sm text-muted-foreground hidden md:block">
                    {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                </p>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/topics/${topic.id}`}>Study</Link>
                </Button>
            </div>
        </div>
    );
}

export function TopicItem({ topic }: { topic: Topic }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-50")}
    >
      <TopicCard topic={topic} />
    </div>
  );
}
