import { adminDb } from '@/lib/firebase';
import type { Folder } from '@/lib/types';
import { NewTopicForm } from './_components/new-topic-form';

async function getFolders(userId: string): Promise<Folder[]> {
  if (!adminDb) {
    console.warn("Firebase Admin not initialized, folders list will be empty.");
    return [];
  }

  const foldersSnapshot = await adminDb.collection('folders')
    .where('userId', '==', userId)
    .get();
  
  if (foldersSnapshot.empty) {
    return [];
  }
  
  const folders = foldersSnapshot.docs.map(doc => {
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
  return folders;
}

export default async function NewTopicPage() {
    // In a real app, you'd get this from auth
    const userId = 'user-123';
    const folders = await getFolders(userId);

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
      <NewTopicForm folders={folders} />
    </div>
  );
}
