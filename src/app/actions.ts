'use server';

import admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-server';
import type { Topic, Flashcard, TestQuestion, Folder } from '@/lib/types';
import { summarizeText } from '@/ai/flows/summarize-text';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { generateTestQuestions } from '@/ai/flows/generate-test';

export async function createTopicAction(formData: { title: string; tags: string; content: string; userId: string; folderId: string | null }) {
  if (!adminDb) {
    console.error("Firebase Admin not initialized. Cannot create topic.");
    return { success: false, error: "Database not configured. Please set FIREBASE_SERVICE_ACCOUNT_BASE64 in your environment variables." };
  }
  
  const { title, tags, content, userId, folderId } = formData;

  try {
    const summaryPromise = summarizeText({ text: content });
    const flashcardsPromise = generateFlashcards({ text: content });
    const testPromise = generateTestQuestions({ text: content });

    const topicsInFolderQuery = adminDb.collection('topics').where('userId', '==', userId).where('folderId', '==', folderId);
    const topicsInFolderSnapshot = await topicsInFolderQuery.count().get();
    const order = topicsInFolderSnapshot.data().count;

    const [summaryResult, flashcardsResult, testResult] = await Promise.all([
      summaryPromise,
      flashcardsPromise,
      testPromise,
    ]);

    const topicRef = adminDb.collection('topics').doc();
    const topicData: Omit<Topic, 'id'> = {
      userId,
      title,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      content,
      summary: summaryResult.summary,
      folderId,
      order,
      status: 'active',
      createdAt: new Date(),
    };

    const batch = adminDb.batch();
    batch.set(topicRef, topicData);

    flashcardsResult.flashcards.forEach(card => {
      const flashcardRef = topicRef.collection('flashcards').doc();
      const flashcardData: Omit<Flashcard, 'id'> = {
        topicId: topicRef.id,
        question: card.question,
        answer: card.answer,
        example: card.example,
      };
      batch.set(flashcardRef, flashcardData);
    });

    testResult.questions.forEach(q => {
        const questionRef = topicRef.collection('testQuestions').doc();
        const questionData: Omit<TestQuestion, 'id'> = {
            topicId: topicRef.id,
            type: q.type,
            question: q.question,
            options: q.options || [],
            answer: q.answer
        };
        batch.set(questionRef, questionData);
    });

    await batch.commit();

    return { success: true, topicId: topicRef.id };
  } catch (error: any) {
    console.error("Error creating topic:", error);
    const errorMessage = error.message || "An unknown error occurred.";
    
    if (errorMessage.includes('SAFETY')) {
        return { success: false, error: "Content moderation error: The provided text could not be processed due to safety policies. Please revise your input." };
    }

    return { success: false, error: `Failed to create topic: ${errorMessage}` };
  }
}

export async function archiveTopicAction(payload: { topicId: string }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
    const { topicId } = payload;
    try {
      const topicRef = adminDb.collection('topics').doc(topicId);
      await topicRef.update({
        status: 'archived',
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error archiving topic:", error);
      return { success: false, error: `Failed to archive topic: ${error.message}` };
    }
}

export async function restoreTopicAction(payload: { topicId: string }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
    const { topicId } = payload;
    try {
      const topicRef = adminDb.collection('topics').doc(topicId);
      const topicDoc = await topicRef.get();
      if (!topicDoc.exists) {
        return { success: false, error: "Topic not found." };
      }
      const topicData = topicDoc.data() as Topic;

      // Find the highest order number in the destination folder
      const topicsInFolderQuery = adminDb.collection('topics')
        .where('userId', '==', topicData.userId)
        .where('folderId', '==', topicData.folderId)
        .where('status', '==', 'active');
        
      const topicsInFolderSnapshot = await topicsInFolderQuery.count().get();
      const newOrder = topicsInFolderSnapshot.data().count;

      await topicRef.update({
        status: 'active',
        order: newOrder,
        archivedAt: admin.firestore.FieldValue.delete(),
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error restoring topic:", error);
      return { success: false, error: `Failed to restore topic: ${error.message}` };
    }
}

async function deleteCollection(collectionRef: admin.firestore.CollectionReference, batchSize: number) {
    const query = collectionRef.limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: admin.firestore.Query, resolve: (value?: unknown) => void) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    const batch = adminDb!.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}

export async function deleteTopicPermanentlyAction(payload: { topicId: string }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
    const { topicId } = payload;
    try {
        const topicRef = adminDb.collection('topics').doc(topicId);
        
        const flashcardsRef = topicRef.collection('flashcards');
        const testQuestionsRef = topicRef.collection('testQuestions');
        
        await Promise.all([
            deleteCollection(flashcardsRef, 50),
            deleteCollection(testQuestionsRef, 50),
        ]);

        await topicRef.delete();

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting topic permanently:", error);
        return { success: false, error: `Failed to delete topic: ${error.message}` };
    }
}


export async function updateTopicSummaryAction(formData: { topicId: string; summary: string }) {
  if (!adminDb) {
    console.error("Firebase Admin not initialized. Cannot update topic.");
    return { success: false, error: "Database not configured." };
  }
  
  const { topicId, summary } = formData;

  try {
    const topicRef = adminDb.collection('topics').doc(topicId);
    await topicRef.update({ summary });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating topic summary:", error);
    return { success: false, error: `Failed to update summary: ${error.message}` };
  }
}

export async function createFolderAction(formData: { name: string; userId: string; color?: string; emoji?: string }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
  
    const { name, userId, color, emoji } = formData;
    try {
      const foldersQuery = adminDb.collection('folders').where('userId', '==', userId);
      const foldersSnapshot = await foldersQuery.count().get();
      const order = foldersSnapshot.data().count;
  
      const folderRef = adminDb.collection('folders').doc();
      const newFolder: Omit<Folder, 'id' | 'createdAt'> & { createdAt: admin.firestore.FieldValue } = {
        userId,
        name,
        order,
        color,
        emoji,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await folderRef.set(newFolder);
      
      const createdDoc = await folderRef.get();
      const createdData = createdDoc.data()!;
      
      const createdFolder: Folder = {
        id: folderRef.id,
        userId: createdData.userId,
        name: createdData.name,
        order: createdData.order,
        color: createdData.color,
        emoji: createdData.emoji,
        createdAt: createdData.createdAt.toDate()
      };

      return { success: true, folder: createdFolder };
    } catch (error: any) {
      console.error("Error creating folder:", error);
      return { success: false, error: `Failed to create folder: ${error.message}` };
    }
  }

  export async function updateFolderAction(formData: { folderId: string; name: string; color?: string; emoji?: string }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
  
    const { folderId, name, color, emoji } = formData;
    try {
      const folderRef = adminDb.collection('folders').doc(folderId);
      
      const updateData: { name: string; color?: string; emoji?: string } = { name };
      if (color) updateData.color = color;
      if (emoji) updateData.emoji = emoji;

      await folderRef.update(updateData);
      
      const updatedDoc = await folderRef.get();
      const updatedData = updatedDoc.data()!;

      const updatedFolder: Folder = {
        id: updatedDoc.id,
        userId: updatedData.userId,
        name: updatedData.name,
        order: updatedData.order,
        color: updatedData.color,
        emoji: updatedData.emoji,
        createdAt: updatedData.createdAt.toDate()
      };

      return { success: true, folder: updatedFolder };
    } catch (error: any) {
      console.error("Error updating folder:", error);
      return { success: false, error: `Failed to update folder: ${error.message}` };
    }
  }
  
  export async function updateItemsOrderAction(payload: { items: { id: string; order: number }[]; type: 'topics' | 'folders' }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
  
    const { items, type } = payload;
    try {
      const batch = adminDb.batch();
      items.forEach(item => {
        const docRef = adminDb.collection(type).doc(item.id);
        batch.update(docRef, { order: item.order });
      });
      await batch.commit();
      return { success: true };
    } catch (error: any) {
      console.error(`Error updating ${type} order:`, error);
      return { success: false, error: `Failed to update order: ${error.message}` };
    }
  }
  
  export async function getReviewDataForTopicsAction(payload: { topicIds: string[] }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }

    const { topicIds } = payload;

    try {
        const allFlashcards: (Flashcard & { topicName: string })[] = [];
        const allTestQuestions: (TestQuestion & { topicName: string })[] = [];

        for (const topicId of topicIds) {
            const topicRef = adminDb.collection('topics').doc(topicId);
            const topicDoc = await topicRef.get();
            if (!topicDoc.exists) continue;

            const topicName = topicDoc.data()?.title || 'Untitled Topic';
            
            const flashcardsPromise = topicRef.collection('flashcards').get();
            const testQuestionsPromise = topicRef.collection('testQuestions').get();

            const [flashcardsSnapshot, testQuestionsSnapshot] = await Promise.all([
                flashcardsPromise,
                testQuestionsPromise
            ]);

            flashcardsSnapshot.docs.forEach(doc => {
                const data = doc.data() as Omit<Flashcard, 'id'>;
                allFlashcards.push({ id: doc.id, ...data, topicName });
            });

            testQuestionsSnapshot.docs.forEach(doc => {
                const data = doc.data() as Omit<TestQuestion, 'id'>;
                allTestQuestions.push({ id: doc.id, ...data, topicName });
            });
        }
        
        return { success: true, flashcards: allFlashcards, testQuestions: allTestQuestions };

    } catch (error: any) {
        console.error("Error fetching review data:", error);
        return { success: false, error: `Failed to fetch review data: ${error.message}` };
    }
}

export async function getTopicDetailsAction(payload: { topicId: string }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
    const { topicId } = payload;
    try {
        const topicRef = adminDb.collection('topics').doc(topicId);
        const topicDoc = await topicRef.get();

        if (!topicDoc.exists) {
            return { success: false, error: "Topic not found." };
        }
        
        const rawData = topicDoc.data()!;

        const flashcardsPromise = topicRef.collection('flashcards').get();
        const testQuestionsPromise = topicRef.collection('testQuestions').get();

        const [flashcardsSnapshot, testQuestionsSnapshot] = await Promise.all([
            flashcardsPromise,
            testQuestionsPromise,
        ]);

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
            order: rawData.order,
            status: rawData.status,
            createdAt: rawData.createdAt.toDate(),
            folderId: rawData.folderId || null,
            lastStudiedAt: rawData.lastStudiedAt ? rawData.lastStudiedAt.toDate() : undefined,
            archivedAt: rawData.archivedAt ? rawData.archivedAt.toDate() : undefined,
        };

        return { success: true, data: { topic, flashcards, testQuestions } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
