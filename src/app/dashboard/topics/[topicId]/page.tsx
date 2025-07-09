import { adminDb } from '@/lib/firebase';
import type { Topic, Flashcard, TestQuestion } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, Copy, TestTube } from 'lucide-react';
import { FlashcardViewer } from './_components/flashcard-viewer';
import { PracticeTest } from './_components/practice-test';

async function getTopicDetails(topicId: string) {
    if (!adminDb) {
        return null;
    }
    const topicRef = adminDb.collection('topics').doc(topicId);
    const topicDoc = await topicRef.get();

    if (!topicDoc.exists) {
        return null;
    }
    
    const rawData = topicDoc.data();
    if (!rawData) {
        return null;
    }

    const flashcardsPromise = topicRef.collection('flashcards').get();
    const testQuestionsPromise = topicRef.collection('testQuestions').get();

    const [flashcardsSnapshot, testQuestionsSnapshot] = await Promise.all([
        flashcardsPromise,
        testQuestionsPromise,
    ]);

    // Firestore data needs to be serialized for client components
    const flashcards: Flashcard[] = flashcardsSnapshot.docs.map(doc => ({
        id: doc.id,
        topicId: doc.data().topicId,
        question: doc.data().question,
        answer: doc.data().answer,
        example: doc.data().example,
    }));

    const testQuestions: TestQuestion[] = testQuestionsSnapshot.docs.map(doc => ({
        id: doc.id,
        topicId: doc.data().topicId,
        type: doc.data().type,
        question: doc.data().question,
        options: doc.data().options || [],
        answer: doc.data().answer,
    }));

    const topic: Topic = {
        id: topicDoc.id,
        userId: rawData.userId,
        title: rawData.title,
        tags: rawData.tags,
        content: rawData.content,
        summary: rawData.summary,
        // Convert timestamp to Date object for serialization
        createdAt: rawData.createdAt.toDate(),
        lastStudiedAt: rawData.lastStudiedAt ? rawData.lastStudiedAt.toDate() : undefined,
    };

    return { topic, flashcards, testQuestions };
}


export default async function TopicDetailsPage({ params }: { params: { topicId: string } }) {
    const data = await getTopicDetails(params.topicId);

    if (!data) {
        notFound();
    }

    const { topic, flashcards, testQuestions } = data;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{topic.title}</h1>
                <p className="text-muted-foreground">Study your topic using the AI-generated materials below.</p>
            </div>

            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary"><BookText className="mr-2 h-4 w-4" />Summary</TabsTrigger>
                    <TabsTrigger value="flashcards"><Copy className="mr-2 h-4 w-4" />Flashcards</TabsTrigger>
                    <TabsTrigger value="test"><TestTube className="mr-2 h-4 w-4" />Practice Test</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI-Generated Summary</CardTitle>
                            <CardDescription>A concise overview of your study material.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap leading-relaxed">{topic.summary}</p>
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
        </div>
    );
}
