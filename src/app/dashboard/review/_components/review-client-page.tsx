'use client';

import { useState } from "react";
import type { Topic, Flashcard, TestQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, ListChecks, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { intelligentReview } from "@/ai/flows/intelligent-review";
import { getReviewDataForTopicsAction } from "@/app/actions";
import { ReviewSession } from "./review-session";

interface ReviewClientPageProps {
    allTopics: Topic[];
    userId: string;
}

export type ReviewItem = (Omit<Flashcard, 'id'> & { itemType: 'flashcard' }) | (Omit<TestQuestion, 'id'> & { itemType: 'question' });

export function ReviewClientPage({ allTopics, userId }: ReviewClientPageProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
    const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
    const [isSessionActive, setIsSessionActive] = useState(false);

    const handleSelectTopic = (topicId: string) => {
        setSelectedTopicIds(prev =>
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
    };
    
    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const startIntelligentReview = async () => {
        setIsLoading(true);
        try {
            const result = await intelligentReview({ 
                userId, 
                // In a real app, these could be user-configurable
                numFlashcards: 10,
                numTestQuestions: 5 
            });

            if (result.flashcards.length === 0 && result.testQuestions.length === 0) {
                 toast({
                    title: "Not Enough Data",
                    description: "We couldn't generate a review session. Try studying more topics and taking tests first.",
                    variant: "default",
                });
                return;
            }

            const flashcardItems: ReviewItem[] = result.flashcards.map(f => ({ ...f, itemType: 'flashcard' }));
            const questionItems: ReviewItem[] = result.testQuestions.map(q => ({ ...q, itemType: 'question' }));
            
            setReviewItems(shuffleArray([...flashcardItems, ...questionItems]));
            setIsSessionActive(true);

        } catch (error: any) {
             toast({
                title: "Error Starting Review",
                description: error.message || "An unknown error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const startCustomReview = async () => {
        if (selectedTopicIds.length === 0) {
            toast({
                title: "No Topics Selected",
                description: "Please select at least one topic to review.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            const result = await getReviewDataForTopicsAction({ topicIds: selectedTopicIds });

            if (result.error) {
                toast({ title: "Error", description: result.error, variant: 'destructive' });
                return;
            }

            const flashcardItems: ReviewItem[] = (result.flashcards || []).map(f => ({ ...f, itemType: 'flashcard' }));
            const questionItems: ReviewItem[] = (result.testQuestions || []).map(q => ({ ...q, itemType: 'question' }));

            if (flashcardItems.length === 0 && questionItems.length === 0) {
                 toast({
                    title: "No Content Found",
                    description: "The selected topics don't have any flashcards or test questions to review.",
                    variant: "default",
                });
                return;
            }

            setReviewItems(shuffleArray([...flashcardItems, ...questionItems]));
            setIsSessionActive(true);

        } catch (error: any) {
             toast({
                title: "Error Starting Review",
                description: error.message || "An unknown error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isSessionActive) {
        return <ReviewSession items={reviewItems} onComplete={() => {
            setIsSessionActive(false);
            setReviewItems([]);
            setSelectedTopicIds([]);
        }} />
    }

    return (
        <Tabs defaultValue="intelligent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="intelligent"><Lightbulb className="mr-2" />Intelligent Review</TabsTrigger>
                <TabsTrigger value="custom"><ListChecks className="mr-2" />Custom Review</TabsTrigger>
            </TabsList>

            <TabsContent value="intelligent" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>AI-Powered Intelligent Review</CardTitle>
                        <CardDescription>
                           Let our AI create a personalized review session based on topics you&apos;ve struggled with the most. This is the most effective way to strengthen your weak points.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button size="lg" className="w-full" onClick={startIntelligentReview} disabled={isLoading}>
                             {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                            Begin Intelligent Review
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Custom Review Session</CardTitle>
                        <CardDescription>
                           Select the specific topics you want to focus on for this review session.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h4 className="font-semibold text-sm">Available Topics:</h4>
                        <ScrollArea className="h-64 w-full rounded-md border p-4">
                           {allTopics.length > 0 ? (
                             <div className="space-y-2">
                                {allTopics.map(topic => (
                                    <div key={topic.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`topic-${topic.id}`} 
                                            checked={selectedTopicIds.includes(topic.id)}
                                            onCheckedChange={() => handleSelectTopic(topic.id)}
                                        />
                                        <Label htmlFor={`topic-${topic.id}`} className="cursor-pointer">{topic.title}</Label>
                                    </div>
                                ))}
                            </div>
                           ) : (
                            <p className="text-muted-foreground text-center">You haven&apos;t created any topics yet.</p>
                           )}
                        </ScrollArea>
                        <Button size="lg" className="w-full" onClick={startCustomReview} disabled={isLoading || selectedTopicIds.length === 0}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Start Custom Review ({selectedTopicIds.length} selected)
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
