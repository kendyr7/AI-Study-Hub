'use client';

import { useState } from 'react';
import type { Flashcard } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

export function FlashcardViewer({ flashcards }: { flashcards: Flashcard[] }) {
    const [flippedStates, setFlippedStates] = useState<Record<string, boolean>>({});

    const toggleFlip = (id: string) => {
        setFlippedStates(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="flex justify-center items-center">
             <Carousel className="w-full max-w-md">
                <CarouselContent>
                    {flashcards.map((card, index) => (
                        <CarouselItem key={card.id}>
                            <div className="p-1">
                                <div 
                                    className="relative w-full aspect-[3/2] cursor-pointer" 
                                    onClick={() => toggleFlip(card.id)}
                                    style={{ perspective: '1000px' }}
                                >
                                    <div
                                        className={`absolute w-full h-full transition-transform duration-700 ease-in-out`}
                                        style={{ transformStyle: 'preserve-3d', transform: flippedStates[card.id] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                                    >
                                        {/* Front of the card */}
                                        <Card className="absolute w-full h-full flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
                                            <p className="text-sm text-muted-foreground mb-2">Question</p>
                                            <p className="text-lg font-semibold">{card.question}</p>
                                        </Card>
                                        {/* Back of the card */}
                                        <Card className="absolute w-full h-full flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                             <p className="text-sm text-muted-foreground mb-2">Answer</p>
                                            <p className="text-lg font-semibold">{card.answer}</p>
                                            {card.example && (
                                                <>
                                                    <p className="text-sm text-muted-foreground mt-4 mb-2">Example</p>
                                                    <p className="text-sm">{card.example}</p>
                                                </>
                                            )}
                                        </Card>
                                    </div>
                                </div>
                                <div className="text-center mt-4">
                                    <Button variant="outline" size="sm" onClick={() => toggleFlip(card.id)}>
                                        <RotateCw className="mr-2 h-4 w-4" />
                                        Flip Card
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">Card {index + 1} of {flashcards.length}</p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
    );
}
