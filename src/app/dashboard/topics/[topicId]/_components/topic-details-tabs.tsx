'use client';

import { useState } from 'react';
import type { Topic, Flashcard, TestQuestion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookText, Copy, TestTube, Edit } from 'lucide-react';
import { FlashcardViewer } from './flashcard-viewer';
import { PracticeTest } from './practice-test';
import { SummaryEditor } from './summary-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TopicDetailsTabsProps {
  initialTopic: Topic;
  flashcards: Flashcard[];
  testQuestions: TestQuestion[];
}

export function TopicDetailsTabs({ initialTopic, flashcards, testQuestions }: TopicDetailsTabsProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="summary"><BookText className="mr-2 h-4 w-4" />Summary</TabsTrigger>
        <TabsTrigger value="flashcards"><Copy className="mr-2 h-4 w-4" />Flashcards</TabsTrigger>
        <TabsTrigger value="test"><TestTube className="mr-2 h-4 w-4" />Practice Test</TabsTrigger>
      </TabsList>
      <TabsContent value="summary" className="mt-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>AI-Generated Summary</CardTitle>
                <CardDescription>A detailed overview of your study material, with key concepts highlighted.</CardDescription>
              </div>
              {!isEditingSummary && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingSummary(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingSummary ? (
              <SummaryEditor
                topicId={topic.id}
                initialSummary={topic.summary}
                onCancel={() => setIsEditingSummary(false)}
                onSave={(newSummary) => {
                  setTopic(prev => ({ ...prev, summary: newSummary }));
                  setIsEditingSummary(false);
                }}
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {topic.summary}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="flashcards" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>Flip through your flashcards to test your recall.</CardDescription>
          </CardHeader>
          <CardContent>
            {flashcards.length > 0 ? (
              <FlashcardViewer flashcards={flashcards} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No flashcards were generated for this topic.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="test" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Practice Test</CardTitle>
            <CardDescription>Check your understanding with a short test.</CardDescription>
          </CardHeader>
          <CardContent>
            {testQuestions.length > 0 ? (
              <PracticeTest questions={testQuestions} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No test questions were generated for this topic.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
