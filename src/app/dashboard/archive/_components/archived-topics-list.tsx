'use client';

import { useState } from 'react';
import type { Topic } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ArchivedTopicItem } from './archived-topic-item';

export function ArchivedTopicsList({ initialTopics }: { initialTopics: Topic[] }) {
  const [topics, setTopics] = useState(initialTopics);

  const handleTopicRestored = (topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId));
  };

  const handleTopicDeleted = (topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId));
  };

  if (topics.length === 0) {
    return (
      <div className="text-center py-10 rounded-2xl border border-dashed border-white/20">
        <p className="text-muted-foreground">Your archive is empty.</p>
      </div>
    );
  }

  return (
    <Card>
        <CardContent className="p-4 space-y-3">
            {topics.map(topic => (
                <ArchivedTopicItem 
                    key={topic.id} 
                    topic={topic}
                    onRestore={handleTopicRestored}
                    onDelete={handleTopicDeleted} 
                />
            ))}
        </CardContent>
    </Card>
  );
}
