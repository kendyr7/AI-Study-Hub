'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { GripVertical, MoreHorizontal, Archive, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { archiveTopicAction } from '@/app/actions';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';

export function TopicCard({ topic, isOverlay = false, children, dragHandleListeners }: { topic: Topic, isOverlay?: boolean, children?: React.ReactNode, dragHandleListeners?: Record<string, any> }) {
    return (
        <div className={cn(
            "flex items-center justify-between w-full p-3 rounded-lg bg-card/80 backdrop-blur-sm",
            isOverlay ? "shadow-lg border border-primary" : "border border-white/10"
        )}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {!isOverlay && (
                    <div {...dragHandleListeners} className="p-1 cursor-grab active:cursor-grabbing">
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
            <div className="flex items-center gap-2 ml-4">
                <p className="text-sm text-muted-foreground hidden md:block">
                    {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                </p>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/topics/${topic.id}`}>Study</Link>
                </Button>
                {!isOverlay && children}
            </div>
        </div>
    );
}

export function TopicItem({ topic, disabled, onArchive }: { topic: Topic, disabled?: boolean, onArchive: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    setIsArchiving(true);
    const result = await archiveTopicAction({ topicId: topic.id });
    if (result.success) {
        toast({ title: "Topic Archived", description: `"${topic.title}" has been moved to the archive.` });
        onArchive(topic.id);
    } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
        setIsArchiving(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(isDragging && "opacity-50")}
    >
      <TopicCard topic={topic} dragHandleListeners={listeners}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isArchiving}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleArchive} disabled={isArchiving}>
                    {isArchiving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
                    <span>Archive</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </TopicCard>
    </div>
  );
}
