'use server';
/**
 * @fileOverview A flow that intelligently surfaces flashcards and test questions from topics where the user has performed poorly.
 *
 * - intelligentReview - A function that returns flashcards and test questions from topics where the user has performed poorly.
 * - IntelligentReviewInput - The input type for the intelligentReview function.
 * - IntelligentReviewOutput - The return type for the intelligentReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminDb } from '@/lib/firebase-server';
import type { Flashcard, TestQuestion, Topic } from '@/lib/types';


const IntelligentReviewInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  numFlashcards: z.number().describe('The number of flashcards to return.'),
  numTestQuestions: z.number().describe('The number of test questions to return.'),
});
export type IntelligentReviewInput = z.infer<typeof IntelligentReviewInputSchema>;

const FlashcardSchema = z.object({
  question: z.string().describe('The flashcard question.'),
  answer: z.string().describe('The flashcard answer.'),
  example: z.string().describe('An example for the flashcard.'),
  topicName: z.string().describe('The topic name of the flashcard.'),
});

const TestQuestionSchema = z.object({
  question: z.string().describe('The test question.'),
  answer: z.string().describe('The correct answer to the test question.'),
  options: z.array(z.string()).describe('The possible answers to the test question.'),
  topicName: z.string().describe('The topic name of the test question.'),
});

const IntelligentReviewOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of flashcards from topics where the user has performed poorly.'),
  testQuestions: z.array(TestQuestionSchema).describe('An array of test questions from topics where the user has performed poorly.'),
});
export type IntelligentReviewOutput = z.infer<typeof IntelligentReviewOutputSchema>;

export async function intelligentReview(input: IntelligentReviewInput): Promise<IntelligentReviewOutput> {
  return intelligentReviewFlow(input);
}

const getPerformanceData = ai.defineTool({
  name: 'getPerformanceData',
  description: 'Retrieves the user performance data for all topics.',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the user.'),
  }),
  outputSchema: z.record(z.string()).describe('A map of topic name to performance score (0-100).'),
}, async ({ userId }) => {
  if (!adminDb) {
    console.warn("Firebase Admin not initialized, cannot get performance data.");
    return {};
  }
  // In a real app, this would be a complex query based on test results.
  // For now, we'll return some mock data.
  // We'll fetch the user's topics and assign random scores.
  const topicsSnapshot = await adminDb.collection('topics').where('userId', '==', userId).get();
  if (topicsSnapshot.empty) {
    return {};
  }
  const performanceData: { [key: string]: number } = {};
  topicsSnapshot.docs.forEach(doc => {
    const topic = doc.data() as Topic;
    // Assign a random score for demonstration
    performanceData[topic.title] = Math.floor(Math.random() * 60) + 20; // Score between 20 and 80
  });
  return performanceData;
});

const getFlashcardsByTopic = ai.defineTool({
  name: 'getFlashcardsByTopic',
  description: 'Retrieves flashcards for a specific topic name.',
  inputSchema: z.object({
    topicName: z.string().describe('The topic name to retrieve flashcards for.'),
    userId: z.string().describe('The ID of the user.'),
    count: z.number().describe('The maximum number of flashcards to retrieve.'),
  }),
  outputSchema: z.array(FlashcardSchema).describe('An array of flashcards for the given topic.'),
}, async ({ topicName, userId, count }) => {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized, cannot get flashcards.");
      return [];
    }
    const topicsSnapshot = await adminDb.collection('topics')
        .where('userId', '==', userId)
        .where('title', '==', topicName)
        .limit(1)
        .get();

    if (topicsSnapshot.empty) {
        return [];
    }
    const topicDoc = topicsSnapshot.docs[0];

    const flashcardsSnapshot = await topicDoc.ref.collection('flashcards').limit(count).get();
    return flashcardsSnapshot.docs.map(doc => {
        const data = doc.data() as Flashcard;
        return {
            question: data.question,
            answer: data.answer,
            example: data.example,
            topicName: topicName
        };
    });
});

const getTestQuestionsByTopic = ai.defineTool({
  name: 'getTestQuestionsByTopic',
  description: 'Retrieves test questions for a specific topic name.',
  inputSchema: z.object({
    topicName: z.string().describe('The topic name to retrieve test questions for.'),
    userId: z.string().describe('The ID of the user.'),
    count: z.number().describe('The maximum number of test questions to retrieve.'),
  }),
  outputSchema: z.array(TestQuestionSchema).describe('An array of test questions for the given topic.'),
}, async ({ topicName, userId, count }) => {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized, cannot get test questions.");
      return [];
    }
    const topicsSnapshot = await adminDb.collection('topics')
        .where('userId', '==', userId)
        .where('title', '==', topicName)
        .limit(1)
        .get();
        
    if (topicsSnapshot.empty) {
        return [];
    }
    const topicDoc = topicsSnapshot.docs[0];

    const questionsSnapshot = await topicDoc.ref.collection('testQuestions').limit(count).get();
    return questionsSnapshot.docs.map(doc => {
        const data = doc.data() as TestQuestion;
        return {
            question: data.question,
            answer: data.answer,
            options: data.options || [],
            topicName: topicName,
        };
    });
});

const intelligentReviewFlow = ai.defineFlow({
    name: 'intelligentReviewFlow',
    inputSchema: IntelligentReviewInputSchema,
    outputSchema: IntelligentReviewOutputSchema,
  }, async (input) => {
    const performanceData = await getPerformanceData({userId: input.userId});

    const sortedTopics = Object.entries(performanceData)
      .sort(([, scoreA], [, scoreB]) => Number(scoreA) - Number(scoreB))
      .map(([topic]) => topic);

    if (sortedTopics.length === 0) {
        return { flashcards: [], testQuestions: [] };
    }

    const flashcards: z.infer<typeof FlashcardSchema>[] = [];
    const testQuestions: z.infer<typeof TestQuestionSchema>[] = [];

    // Distribute the fetch count across the weakest topics
    const topicsToSampleFrom = sortedTopics.slice(0, 3); // Focus on the 3 weakest topics

    for (const topicName of topicsToSampleFrom) {
      if (flashcards.length < input.numFlashcards) {
        const numToFetch = Math.ceil((input.numFlashcards - flashcards.length) / topicsToSampleFrom.length);
        if (numToFetch > 0) {
            const topicFlashcards = await getFlashcardsByTopic({topicName, userId: input.userId, count: numToFetch});
            flashcards.push(...topicFlashcards);
        }
      }

      if (testQuestions.length < input.numTestQuestions) {
        const numToFetch = Math.ceil((input.numTestQuestions - testQuestions.length) / topicsToSampleFrom.length);
        if (numToFetch > 0) {
            const topicTestQuestions = await getTestQuestionsByTopic({topicName, userId: input.userId, count: numToFetch});
            testQuestions.push(...topicTestQuestions);
        }
      }
    }

    return {
      flashcards: flashcards.slice(0, input.numFlashcards),
      testQuestions: testQuestions.slice(0, input.numTestQuestions),
    };
  }
);
