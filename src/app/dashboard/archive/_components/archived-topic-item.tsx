'use client';

import { useState } from 'react';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { restoreTopicAction, deleteTopicPermanentlyAction } from '@/app/actions';
import { Loader2, Trash, Undo } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ArchivedTopicItemProps {
    topic: Topic;
    onRestore: (topicId: string) => void;
    onDelete: (topicId: string) => void;
}

export function ArchivedTopicItem({ topic, onRestore, onDelete }: ArchivedTopicItemProps) {
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleRestore = async () => {
        setIsRestoring(true);
        const result = await restoreTopicAction({ topicId: topic.id });
        if (result.success) {
            toast({ title: 'Topic Restored', description: `"${topic.title}" has been moved back to your topics.` });
            onRestore(topic.id);
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
            setIsRestoring(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteTopicPermanentlyAction({ topicId: topic.id });
         if (result.success) {
            toast({ title: 'Topic Deleted', description: `"${topic.title}" has been permanently deleted.` });
            onDelete(topic.id);
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-white/10 gap-4">
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{topic.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Archived {topic.archivedAt ? formatDistanceToNow(topic.archivedAt, { addSuffix: true }) : ''}
                </p>
            </div>
            <div className="flex items-center gap-2 ml-auto sm:ml-4 shrink-0">
                <Button variant="outline" size="sm" onClick={handleRestore} disabled={isRestoring || isDeleting}>
                    {isRestoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Undo className="mr-2 h-4 w-4" />}
                    Restore
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm" disabled={isRestoring || isDeleting}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the topic and all of its associated data (summaries, flashcards, and test questions).
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Yes, delete permanently
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
