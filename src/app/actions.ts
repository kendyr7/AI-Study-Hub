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

export async function createFolderAction(formData: { name: string; userId: string }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
  
    const { name, userId } = formData;
    try {
      const foldersQuery = adminDb.collection('folders').where('userId', '==', userId);
      const foldersSnapshot = await foldersQuery.count().get();
      const order = foldersSnapshot.data().count;
  
      const folderRef = adminDb.collection('folders').doc();
      const newFolder: Omit<Folder, 'id' | 'createdAt'> & { createdAt: admin.firestore.FieldValue } = {
        userId,
        name,
        order,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await folderRef.set(newFolder);
      
      const createdFolder: Folder = {
        id: folderRef.id,
        userId,
        name,
        order,
        createdAt: new Date()
      };

      return { success: true, folder: createdFolder };
    } catch (error: any) {
      console.error("Error creating folder:", error);
      return { success: false, error: `Failed to create folder: ${error.message}` };
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
  
  export async function updateTopicFolderAction(payload: { topicId: string; newFolderId: string | null; newOrder: number }) {
    if (!adminDb) {
      return { success: false, error: "Database not configured." };
    }
  
    const { topicId, newFolderId, newOrder } = payload;
    try {
      const topicRef = adminDb.collection('topics').doc(topicId);
      await topicRef.update({ folderId: newFolderId, order: newOrder });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating topic folder:", error);
      return { success: false, error: `Failed to move topic: ${error.message}` };
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
