
'use client';

import { useState, useEffect } from 'react';
import { Progress } from './progress';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const studyTips = [
    "Tip: Break down large topics into smaller, manageable chunks.",
    "Tip: Use the Feynman technique: explain a concept in simple terms.",
    "Tip: Test yourself frequently instead of just re-reading.",
    "Tip: Spaced repetition is key to long-term memory.",
    "Tip: Get enough sleep. Your brain consolidates memories while you rest.",
    "Tip: Stay hydrated and eat nutritious food to fuel your brain.",
    "Tip: Teach what you've learned to someone else.",
    "Tip: Find a dedicated study space to minimize distractions."
];

interface LoadingOverlayProps {
  isLoading: boolean;
  progress: number;
}

export function LoadingOverlay({ isLoading, progress }: LoadingOverlayProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setTipIndex(prevIndex => (prevIndex + 1) % studyTips.length);
      }, 4000); // Change tip every 4 seconds
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  return (
    <div className={cn(
        "fixed inset-0 z-[100] bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center transition-opacity duration-500",
        isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
        <div className="w-full max-w-md px-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                <h1 className="text-3xl font-headline font-bold">Generating Your Study Hub</h1>
            </div>
            <p className="text-muted-foreground mb-4">Our AI is analyzing your content, please wait a moment...</p>
            <Progress value={progress} className="w-full h-3 mb-6" />
            
            <div className="min-h-[40px] flex items-center justify-center">
                <p className="text-lg text-primary transition-opacity duration-500">
                    {studyTips[tipIndex]}
                </p>
            </div>
        </div>
    </div>
  );
}
