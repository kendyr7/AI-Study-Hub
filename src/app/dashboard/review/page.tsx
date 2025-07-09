import { adminDb } from "@/lib/firebase";
import type { Topic } from "@/lib/types";
import { ReviewClientPage } from "./_components/review-client-page";

async function getAllTopics(userId: string) {
    if (!adminDb) {
        console.warn("Firebase Admin not initialized, topics list will be empty.");
        return [];
    }
    const topicsSnapshot = await adminDb.collection('topics')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .get();

    const topics: Topic[] = topicsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            folderId: data.folderId,
            title: data.title,
            tags: data.tags,
            content: data.content,
            summary: data.summary,
            order: data.order,
            status: data.status,
            createdAt: data.createdAt.toDate(),
        };
    });

    topics.sort((a,b) => a.title.localeCompare(b.title));
    return topics;
}


export default async function ReviewPage() {
    const userId = 'user-123'; // Placeholder
    const allTopics = await getAllTopics(userId);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Review Session</h1>
                <p className="text-muted-foreground">
                    Focus on your weak spots with an AI-driven session or create your own custom review.
                </p>
            </div>

            <ReviewClientPage allTopics={allTopics} userId={userId} />
        </div>
    );
}
