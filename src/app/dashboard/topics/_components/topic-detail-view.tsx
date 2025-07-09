'use client';

import { useState, useEffect } from 'react';
import type { Topic, Flashcard, TestQuestion } from '@/lib/types';
import { getTopicDetailsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, BookText, Copy, TestTube, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FlashcardViewer } from '@/components/study/flashcard-viewer';
import { PracticeTest } from '@/components/study/practice-test';
import { SummaryDisplay } from '@/components/study/summary-display';

interface TopicDetailViewProps {
  topicId: string;
  onClose: () => void;
  onTopicUpdate: (updatedTopic: Topic) => void;
}

type TopicData = {
  topic: Topic;
  flashcards: Flashcard[];
  testQuestions: TestQuestion[];
};

function TopicDetailSkeleton() {
    return (
        <div className="p-4 space-y-4 h-full">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="pt-4 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    )
}

export function TopicDetailView({ topicId, onClose, onTopicUpdate }: TopicDetailViewProps) {
  const [data, setData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!topicId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      const result = await getTopicDetailsAction({ topicId });
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load topic details.');
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
      setLoading(false);
    };

    fetchDetails();
  }, [topicId, toast]);

  if (loading) {
    return <TopicDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Topic</AlertTitle>
            <AlertDescription>{error || "An unexpected error occurred."}</AlertDescription>
        </Alert>
         <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  const { topic, flashcards, testQuestions } = data;

  const handleSummaryUpdated = (newSummary: string) => {
    const updatedTopic = { ...topic, summary: newSummary };
    setData(prevData => prevData ? { ...prevData, topic: updatedTopic } : null);
    onTopicUpdate(updatedTopic);
  };

  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="flex items-center justify-between p-3 border-b border-white/10 shrink-0">
        <h2 className="text-lg font-semibold truncate" title={topic.title}>{topic.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <Tabs defaultValue="summary" className="w-full p-4">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary"><BookText className="mr-2 h-4 w-4" />Summary</TabsTrigger>
                <TabsTrigger value="flashcards"><Copy className="mr-2 h-4 w-4" />Flashcards</TabsTrigger>
                <TabsTrigger value="test"><TestTube className="mr-2 h-4 w-4" />Practice Test</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
                <SummaryDisplay topic={topic} onSummaryUpdated={handleSummaryUpdated} />
            </TabsContent>
            <TabsContent value="flashcards" className="mt-4">
                {flashcards.length > 0 ? (
                <FlashcardViewer flashcards={flashcards} />
                ) : (
                <p className="text-muted-foreground text-center py-8">No flashcards were generated for this topic.</p>
                )}
            </TabsContent>
            <TabsContent value="test" className="mt-4">
                {testQuestions.length > 0 ? (
                <PracticeTest questions={testQuestions} />
                ) : (
                <p className="text-muted-foreground text-center py-8">No test questions were generated for this topic.</p>
                )}
            </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
