import { adminDb } from "@/lib/firebase-server";
import type { Topic, Folder } from "@/lib/types";
import { TopicsView } from "./_components/topics-view";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
            color: data.color || undefined,
            emoji: data.emoji || undefined,
        };
    });

    topics.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    folders.sort((a, b) => a.order - b.order);

    return { topics, folders };
}

function TopicsViewSkeleton() {
    return (
        <div className="flex h-[calc(100vh-6rem)] w-full items-center justify-center">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    )
}

export default async function TopicsPage() {
    const userId = 'user-123';
    const { topics, folders } = await getTopicsAndFolders(userId);

    return (
        <Suspense fallback={<TopicsViewSkeleton />}>
            <TopicsView initialTopics={topics} initialFolders={folders} />
        </Suspense>
    );
}
