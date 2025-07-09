'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTopicAction } from '@/app/actions';

export default function NewTopicPage() {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
      
      const result = await createTopicAction({ title, tags, content, userId });

      if (result.success) {
        toast({
          title: "Topic Created!",
          description: "Your new study topic has been generated.",
        });
        // We will eventually redirect to the topic page, for now, redirect to the list.
        router.push('/dashboard/topics');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to generate topic:", error);
      toast({
        title: "Error",
        description: "Failed to generate the study topic. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">New Topic</h1>
          <p className="text-muted-foreground">
            Add your study material below to generate summaries, flashcards, and tests.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create Topic</CardTitle>
          <CardDescription>
            Fill in the details for your new study topic. The content will be processed by our AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input 
                id="tags" 
                placeholder="e.g., History, Art, Europe"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isLoading}
              />
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
    </div>
  );
}
