'use client';

import { useState } from 'react';
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
import { Loader2, Sparkles, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTopicAction } from '@/app/actions';
import type { Folder } from '@/lib/types';
import { NewFolderDialog } from '../../_components/new-folder-dialog';
import { TagInput } from '@/components/ui/tag-input';

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
  const router = useRouter();
  const { toast } = useToast();

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

    try {
      // In a real app, you'd get the userId from an auth context.
      const userId = 'user-123'; // Placeholder
      
      const result = await createTopicAction({ title, tags: tags.join(','), content, userId, folderId });

      if (result.success && result.topicId) {
        toast({
          title: "Topic Created!",
          description: "Your new study topic has been generated.",
        });
        router.push(`/dashboard/topics/${result.topicId}`);
      } else {
        toast({
          title: "Error Creating Topic",
          description: result.error || "An unknown server error occurred.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to generate topic:", error);
      toast({
        title: "Error Creating Topic",
        description: error.message || "A network error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
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
                className="min-h-[300px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Topic
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
  );
}
