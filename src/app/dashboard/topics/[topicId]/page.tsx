import { adminDb } from '@/lib/firebase';
import type { Topic, Flashcard, TestQuestion } from '@/lib/types';
import { notFound } from 'next/navigation';
import { TopicDetailsTabs } from './_components/topic-details-tabs';


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
            <TopicDetailsTabs 
                initialTopic={topic}
                flashcards={flashcards}
                testQuestions={testQuestions}
            />
        </div>
    );
}
