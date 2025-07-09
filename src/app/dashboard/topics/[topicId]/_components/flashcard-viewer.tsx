'use client';

import { useState, useMemo, CSSProperties } from 'react';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';
import type { Flashcard } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SWIPE_THRESHOLD = 150;

function DraggableFlashcard({
  card,
  isTopCard,
}: {
  card: Flashcard;
  isTopCard: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !isTopCard,
  });

  const style: CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.x / 20}deg)`,
        transition: isDragging ? 'none' : 'transform 0.5s',
      }
    : {};

  const handleFlip = () => {
    if (isDragging) return;
    setFlipped(f => !f);
  };
  
  const frontOpacity = useMemo(() => {
    if (!transform) return 1;
    return Math.max(0, 1 - Math.abs(transform.x) / SWIPE_THRESHOLD * 1.5);
  }, [transform]);

  const recapOpacity = useMemo(() => {
    if (!transform) return 0;
    return Math.max(0, (-transform.x / SWIPE_THRESHOLD) * 2);
  }, [transform]);

  const learnedOpacity = useMemo(() => {
    if (!transform) return 0;
    return Math.max(0, (transform.x / SWIPE_THRESHOLD) * 2);
  }, [transform]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'absolute w-full h-full transition-all duration-300 ease-in-out',
        isDragging ? 'cursor-grabbing' : isTopCard ? 'cursor-grab' : ''
      )}
    >
      <div
        className="relative w-full h-full"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          <div style={{ opacity: recapOpacity }} className="text-red-500 font-bold text-2xl border-2 border-red-500 p-2 rounded-lg -rotate-12 bg-card/80">RECAP</div>
          <div style={{ opacity: learnedOpacity }} className="text-green-500 font-bold text-2xl border-2 border-green-500 p-2 rounded-lg rotate-12 bg-card/80">LEARNED</div>
        </div>

        <div
            className={`relative w-full h-full transition-transform duration-700 ease-in-out`}
            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
            <Card className="absolute w-full h-full flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden', opacity: frontOpacity }}>
                <p className="text-sm text-muted-foreground mb-2">Question</p>
                <p className="text-xl font-semibold">{card.question}</p>
            </Card>
            <Card className="absolute w-full h-full flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-sm text-muted-foreground mb-2">Answer</p>
                <p className="text-xl font-semibold">{card.answer}</p>
                {card.example && (
                    <>
                        <p className="text-sm text-muted-foreground mt-4 mb-2">Example</p>
                        <p className="text-sm">{card.example}</p>
                    </>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}


export function FlashcardViewer({ flashcards }: { flashcards: Flashcard[] }) {
  const [activeCards, setActiveCards] = useState([...flashcards]);

  const removeTopCard = (direction: 'left' | 'right') => {
    setActiveCards(prev => prev.slice(1));
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    if (Math.abs(delta.x) > SWIPE_THRESHOLD) {
      if (delta.x > SWIPE_THRESHOLD) {
        removeTopCard('right');
      } else {
        removeTopCard('left');
      }
    }
  };

  const resetCards = () => {
      setActiveCards([...flashcards]);
  }

  if (activeCards.length === 0) {
      return (
          <div className="text-center space-y-4 py-8">
              <h3 className="text-2xl font-bold">Review Complete!</h3>
              <p className="text-muted-foreground">You've gone through all the flashcards for this topic.</p>
              <Button onClick={resetCards}>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Review Again
              </Button>
          </div>
      )
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
        <div className="relative w-full max-w-md mx-auto aspect-[3/2]">
            {activeCards.map((card, index) => (
                <DraggableFlashcard
                    key={card.id}
                    card={card}
                    isTopCard={index === 0}
                />
            )).reverse()}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">Card {flashcards.length - activeCards.length + 1} of {flashcards.length}</p>
        <p className="text-sm text-muted-foreground mt-2 text-center">Click card to flip. Drag left to recap, right if you've learned it.</p>
    </DndContext>
  );
}