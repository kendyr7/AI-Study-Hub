import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { adminDb } from "@/lib/firebase-server";
import type { Topic, Folder } from "@/lib/types";
import { TopicsList } from "./_components/topics-list";

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
            folderId: data.folderId,
            title: data.title,
            tags: data.tags,
            content: data.content,
            summary: data.summary,
            order: data.order,
            status: data.status || 'active',
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

    topics.sort((a, b) => a.order - b.order);
    folders.sort((a, b) => a.order - b.order);

    return { topics, folders };
}

export default async function TopicsPage() {
    const userId = 'user-123';
    const { topics, folders } = await getTopicsAndFolders(userId);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">My Topics</h1>
                    <p className="text-muted-foreground">Organize your study materials into folders and topics.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/dashboard/topics/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Topic
                        </Link>
                    </Button>
                </div>
            </div>

            <TopicsList initialTopics={topics} initialFolders={folders} />
        </div>
    );
}
