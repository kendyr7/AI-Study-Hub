'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateTopicSummaryAction } from '@/app/actions';
import { Bold, Italic, Code, List, ListOrdered, Link, Quote, Loader2 } from 'lucide-react';

interface SummaryEditorProps {
  topicId: string;
  initialSummary: string;
  onSave: (newSummary: string) => void;
  onCancel: () => void;
}

export function SummaryEditor({ topicId, initialSummary, onSave, onCancel }: SummaryEditorProps) {
  const [summary, setSummary] = useState(initialSummary);
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
    
    // After state update, focus and select the placeholder/text
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
    const result = await updateTopicSummaryAction({ topicId, summary });

    if (result.success) {
      toast({ title: 'Summary Updated', description: 'Your changes have been saved.' });
      onSave(summary);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-1 flex-wrap p-1 border rounded-md bg-background/50">
            <Button variant="ghost" size="icon" onClick={() => insertMarkdown('**', '**', 'bold text')} title="Bold"><Bold className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => insertMarkdown('*', '*', 'italic text')} title="Italic"><Italic className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => insertMarkdown('```\n', '\n```', 'code block')} title="Code Block"><Code className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => insertMarkdown('\n* ', '', 'List item')} title="Bullet List"><List className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => insertMarkdown('\n1. ', '', 'List item')} title="Numbered List"><ListOrdered className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => insertMarkdown('> ', '', 'Quote')} title="Quote"><Quote className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => insertMarkdown('[', '](url)', 'link text')} title="Link"><Link className="w-4 h-4" /></Button>
        </div>
      <Textarea
        ref={textareaRef}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="min-h-[400px] font-mono text-sm"
        disabled={isSaving}
        placeholder="Start writing your summary here..."
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
