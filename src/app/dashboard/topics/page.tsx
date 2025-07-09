import { adminDb } from "@/lib/firebase-server";
import type { Topic, Folder } from "@/lib/types";
import { TopicsView } from "./_components/topics-view";

async function getTopicsAndFolders(userId: string) {
    if (!adminDb) {
        console.warn("Firebase Admin not initialized, topics list will be empty.");
        return { topics: [], folders: [] };
    }

    const topicsPromise = adminDb.collection('topics').where('userId', '==', userId).get();
    const foldersPromise = adminDb.collection('folders').where('userId', '==', userId).get();

    const [topicsSnapshot, foldersSnapshot] = await Promise.all([topicsPromise, foldersPromise]);

    const topics: Topic[] = topicsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            folderId: data.folderId || null,
            title: data.title,
            tags: data.tags,
            content: data.content,
            summary: data.summary,
            order: data.order,
            status: data.status || 'active',
            createdAt: data.createdAt.toDate(),
            archivedAt: data.archivedAt ? data.archivedAt.toDate() : undefined,
            lastStudiedAt: data.lastStudiedAt ? data.lastStudiedAt.toDate() : undefined,
        };
    }).filter(topic => topic.status === 'active');

    const folders: Folder[] = foldersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            name: data.name,
            order: data.order,
            createdAt: data.createdAt.toDate(),
        };
    });

    topics.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    folders.sort((a, b) => a.order - b.order);

    return { topics, folders };
}

export default async function TopicsPage() {
    const userId = 'user-123';
    const { topics, folders } = await getTopicsAndFolders(userId);

    return (
        <TopicsView initialTopics={topics} initialFolders={folders} />
    );
}
