import { adminDb } from "@/lib/firebase-server";
import type { Topic } from "@/lib/types";
import { ArchivedTopicsList } from "./_components/archived-topics-list";

async function getArchivedTopics(userId: string) {
    if (!adminDb) {
        console.warn("Firebase Admin not initialized, archived topics list will be empty.");
        return [];
    }
    const topicsSnapshot = await adminDb.collection('topics')
        .where('userId', '==', userId)
        .where('status', '==', 'archived')
        .orderBy('archivedAt', 'desc')
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
            archivedAt: data.archivedAt ? data.archivedAt.toDate() : undefined,
        };
    });

    return topics;
}


export default async function ArchivePage() {
    const userId = 'user-123'; // Placeholder
    const archivedTopics = await getArchivedTopics(userId);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Archive</h1>
                <p className="text-muted-foreground">
                    View and manage your archived topics.
                </p>
            </div>

            <ArchivedTopicsList initialTopics={archivedTopics} />
        </div>
    );
}
