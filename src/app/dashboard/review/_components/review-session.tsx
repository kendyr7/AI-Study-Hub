'use client';

import { useState } from 'react';
import type { ReviewItem } from './review-client-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FlashcardViewer } from '@/components/study/flashcard-viewer';
import { PracticeTest } from '@/components/study/practice-test';
import type { Flashcard, TestQuestion } from '@/lib/types';
import { CheckCircle, Repeat } from 'lucide-react';

interface ReviewSessionProps {
    items: ReviewItem[];
    onComplete: () => void;
}

export function ReviewSession({ items, onComplete }: ReviewSessionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionFinished, setSessionFinished] = useState(false);
    
    // We need to create mock full objects because the child components expect full types
    const currentItem = items[currentIndex];
    
    let mockFlashcard: Flashcard | undefined;
    let mockQuestion: TestQuestion | undefined;

    if (currentItem?.itemType === 'flashcard') {
        mockFlashcard = {
            id: `flashcard-${currentIndex}`, // A temporary unique ID
            topicId: currentItem.topicId || '',
            ...currentItem
        };
    } else if (currentItem?.itemType === 'question') {
        mockQuestion = {
            id: `question-${currentIndex}`, // A temporary unique ID
            topicId: currentItem.topicId || '',
            ...currentItem
        }
    }

    const goToNext = () => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setSessionFinished(true);
        }
    };
    
    if (sessionFinished) {
        return (
            <Card className="max-w-2xl mx-auto text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold font-headline mb-2">Session Complete!</h2>
                <p className="text-muted-foreground mb-6">You've reviewed {items.length} items. Keep up the great work!</p>
                <Button onClick={onComplete}>
                    <Repeat className="mr-2" />
                    Start Another Review
                </Button>
            </Card>
        );
    }
    
    if (!currentItem) {
        // This case should ideally not be hit if onComplete is called correctly
        return (
            <div className="text-center">
                <p>No items to review.</p>
                <Button onClick={onComplete}>Back</Button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-primary">{currentItem.topicName}</p>
                    <p className="text-sm text-muted-foreground">Item {currentIndex + 1} of {items.length}</p>
                </div>
                <Progress value={(currentIndex + 1) / items.length * 100} />
            </div>
            
            <Card>
                <CardContent className="p-4 sm:p-6">
                    {mockFlashcard && (
                         <div className="min-h-[300px] flex flex-col justify-center">
                            <FlashcardViewer flashcards={[mockFlashcard]} />
                         </div>
                    )}
                     {mockQuestion && (
                         <div className="min-h-[300px] flex flex-col justify-center">
                            <PracticeTest questions={[mockQuestion]} />
                         </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={goToNext} size="lg">
                    {currentIndex < items.length - 1 ? 'Next Item' : 'Finish Session'}
                </Button>
            </div>
        </div>
    );
}
