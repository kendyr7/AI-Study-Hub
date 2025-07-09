'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateTopicSummaryAction } from '@/app/actions';
import { Bold, Italic, Code, List, ListOrdered, Link, Quote, Loader2, Edit, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Topic } from '@/lib/types';

interface SummaryDisplayProps {
  topic: Topic;
  onSummaryUpdated: (newSummary: string) => void;
}

export function SummaryDisplay({ topic, onSummaryUpdated }: SummaryDisplayProps) {
  const [summary, setSummary] = useState(topic.summary);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const insertMarkdown = (prefix: string, suffix: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = summary.substring(start, end);

    const replacement = prefix + (selectedText || placeholder) + suffix;
    const newText = summary.substring(0, start) + replacement + summary.substring(end);
    
    setSummary(newText);
    
    setTimeout(() => {
        textarea.focus();
        if (selectedText) {
            textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        } else {
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
        }
    }, 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateTopicSummaryAction({ topicId: topic.id, summary });

    if (result.success) {
      toast({ title: 'Summary Updated', description: 'Your changes have been saved.' });
      onSummaryUpdated(summary);
      setIsEditing(false);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setSummary(topic.summary);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap p-1 border rounded-md bg-background/50">
                <Button variant="ghost" size="icon" onClick={() => insertMarkdown('**', '**', 'bold text')} title="Bold"><Bold className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => insertMarkdown('*', '*', 'italic text')} title="Italic"><Italic className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => insertMarkdown('```\n', '\n```', 'code block')} title="Code Block"><Code className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => insertMarkdown('\n* ', '', 'List item')} title="Bullet List"><List className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => insertMarkdown('\n1. ', '', 'List item')} title="Numbered List"><ListOrdered className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => insertMarkdown('> ', '', 'Quote')} title="Quote"><Quote className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => insertMarkdown('[', '](url)', 'link text')} title="Link"><Link className="w-4 h-4" /></Button>
            </div>
             <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                  Save
                </Button>
              </div>
          </div>
        <Textarea
          ref={textareaRef}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="min-h-[400px] font-mono text-sm"
          disabled={isSaving}
          placeholder="Start writing your summary here..."
        />
      </div>
    );
  }

  return (
    <div>
        <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Button>
        </div>
        <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {topic.summary}
            </ReactMarkdown>
        </div>
    </div>
  )
}
