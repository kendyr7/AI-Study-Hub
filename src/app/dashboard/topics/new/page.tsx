import { adminDb } from '@/lib/firebase';
import type { Folder } from '@/lib/types';
import { NewTopicForm } from './_components/new-topic-form';

async function getNewTopicPageData(userId: string): Promise<{folders: Folder[], allTags: string[]}> {
  if (!adminDb) {
    console.warn("Firebase Admin not initialized, folders list will be empty.");
    return { folders: [], allTags: [] };
  }

  const foldersPromise = adminDb.collection('folders').where('userId', '==', userId).get();
  const topicsPromise = adminDb.collection('topics').where('userId', '==', userId).where('status', '==', 'active').get();

  const [foldersSnapshot, topicsSnapshot] = await Promise.all([foldersPromise, topicsPromise]);
  
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

  // Sort in application code to avoid needing a composite index
  folders.sort((a, b) => a.order - b.order);

  const allTags = [...new Set(topicsSnapshot.docs.flatMap(doc => doc.data().tags || []))].sort();

  return { folders, allTags };
}

export default async function NewTopicPage() {
    // In a real app, you'd get this from auth
    const userId = 'user-123';
    const { folders, allTags } = await getNewTopicPageData(userId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">New Topic</h1>
          <p className="text-muted-foreground">
            Add your study material below to generate summaries, flashcards, and tests.
          </p>
        </div>
      </div>
      <NewTopicForm folders={folders} allTags={allTags} />
    </div>
  );
}
