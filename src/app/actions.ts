'use server';

import { adminDb } from '@/lib/firebase';
import type { Topic, Flashcard, TestQuestion } from '@/lib/types';
import { summarizeText } from '@/ai/flows/summarize-text';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { generateTestQuestions } from '@/ai/flows/generate-test';

export async function createTopicAction(formData: { title: string; tags: string; content: string; userId: string; }) {
  if (!adminDb) {
    console.error("Firebase Admin not initialized. Cannot create topic.");
    return { success: false, error: "Database not configured. Please set FIREBASE_SERVICE_ACCOUNT_BASE64 in your environment variables." };
  }
  
  const { title, tags, content, userId } = formData;

  try {
    const summaryPromise = summarizeText({ text: content });
    const flashcardsPromise = generateFlashcards({ text: content });
    const testPromise = generateTestQuestions({ text: content });

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
            options: q.options,
            answer: q.answer
        };
        batch.set(questionRef, questionData);
    });

    await batch.commit();

    return { success: true, topicId: topicRef.id };
  } catch (error: any) {
    console.error("Error creating topic:", error);
    const errorMessage = error.message || "An unknown error occurred.";
    
    // Provide more specific feedback for common AI errors
    if (errorMessage.includes('SAFETY')) {
        return { success: false, error: "Content moderation error: The provided text could not be processed due to safety policies. Please revise your input." };
    }

    return { success: false, error: `Failed to create topic: ${errorMessage}` };
  }
}
