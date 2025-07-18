'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Sparkles, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTopicAction } from '@/app/actions';
import type { Folder } from '@/lib/types';
import { NewFolderDialog } from '../../_components/new-folder-dialog';
import { TagInput } from '@/components/ui/tag-input';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

interface NewTopicFormProps {
  folders: Folder[];
  allTags: string[];
}

export function NewTopicForm({ folders: initialFolders, allTags }: NewTopicFormProps) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading && progress < 90) {
      timer = setTimeout(() => {
        setProgress(p => p + 1);
      }, 100); // Adjust timing to feel right, e.g., 10 seconds to reach 90%
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, progress]);

  const handleFolderCreated = (newFolder: Folder) => {
    setFolders(currentFolders => [...currentFolders, newFolder]);
    setFolderId(newFolder.id);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and some content for your topic.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setProgress(0);

    try {
      // In a real app, you'd get the userId from an auth context.
      const userId = 'user-123'; // Placeholder
      
      const result = await createTopicAction({ title, tags: tags.join(','), content, userId, folderId });
      
      setProgress(100);

      if (result.success && result.topicId) {
        toast({
          title: "Topic Created!",
          description: "Your new study topic has been generated.",
        });
        // A brief delay to let the user see the 100% state
        setTimeout(() => {
            router.push(`/dashboard/topics?topicId=${result.topicId}`);
        }, 500);
      } else {
        setIsLoading(false);
        toast({
          title: "Error Creating Topic",
          description: result.error || "An unknown server error occurred.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to generate topic:", error);
      setIsLoading(false);
      toast({
        title: "Error Creating Topic",
        description: error.message || "A network error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} progress={progress} />
      <Card>
        <CardHeader>
          <CardTitle>Create Topic</CardTitle>
          <CardDescription>
            Fill in the details for your new study topic. The content will be processed by our AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="title">Topic Title</Label>
                    <Input 
                        id="title" 
                        placeholder="e.g., The Renaissance" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="folder">Folder (Optional)</Label>
                    <div className="flex items-center gap-2">
                        <Select onValueChange={(value) => setFolderId(value === 'none' ? null : value)} value={folderId || 'none'} disabled={isLoading}>
                            <SelectTrigger id="folder">
                                <SelectValue placeholder="Select a folder" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No folder</SelectItem>
                                {folders.map(folder => (
                                    <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <NewFolderDialog onFolderCreated={handleFolderCreated}>
                            <Button variant="outline" size="icon" type="button" title="Create new folder" disabled={isLoading}>
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </NewFolderDialog>
                    </div>
                </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <TagInput
                allTags={allTags}
                selectedTags={tags}
                setSelectedTags={setTags}
                disabled={isLoading}
                placeholder="Add tags..."
              />
               <p className="text-sm text-muted-foreground">
                Separate tags with a comma or press Enter.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Study Content</Label>
              <Textarea 
                id="content"
                placeholder="Paste your article, notes, or any text here..."
                className="min-h-[200px] md:min-h-[300px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Topic
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
