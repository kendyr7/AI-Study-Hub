// src/ai/flows/intelligent-review.ts
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

const IntelligentReviewInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  numFlashcards: z.number().describe('The number of flashcards to return.'),
  numTestQuestions: z.number().describe('The number of test questions to return.'),
});
export type IntelligentReviewInput = z.infer<typeof IntelligentReviewInputSchema>;

const FlashcardSchema = z.object({
  question: z.string().describe('The flashcard question.'),
  answer: z.string().describe('The flashcard answer.'),
  topic: z.string().describe('The topic of the flashcard.'),
});

const TestQuestionSchema = z.object({
  question: z.string().describe('The test question.'),
  answer: z.string().describe('The correct answer to the test question.'),
  options: z.array(z.string()).describe('The possible answers to the test question.'),
  topic: z.string().describe('The topic of the test question.'),
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
  outputSchema: z.record(z.number()).describe('A map of topic to performance score (0-100).'),
}, async (input) => {
  // TODO: Implement the logic to retrieve the user's performance data from the database.
  // This is a placeholder implementation.
  return {
    'Topic 1': 60,
    'Topic 2': 40,
    'Topic 3': 80,
  };
});

const getFlashcardsByTopic = ai.defineTool({
  name: 'getFlashcardsByTopic',
  description: 'Retrieves flashcards for a specific topic.',
  inputSchema: z.object({
    topic: z.string().describe('The topic to retrieve flashcards for.'),
    count: z.number().describe('The maximum number of flashcards to retrieve.'),
  }),
  outputSchema: z.array(FlashcardSchema).describe('An array of flashcards for the given topic.'),
}, async (input) => {
  // TODO: Implement the logic to retrieve flashcards from the database.
  // This is a placeholder implementation.
  return [
    {question: `Question 1 for ${input.topic}`, answer: `Answer 1 for ${input.topic}`, topic: input.topic},
    {question: `Question 2 for ${input.topic}`, answer: `Answer 2 for ${input.topic}`, topic: input.topic},
  ].slice(0, input.count);
});

const getTestQuestionsByTopic = ai.defineTool({
  name: 'getTestQuestionsByTopic',
  description: 'Retrieves test questions for a specific topic.',
  inputSchema: z.object({
    topic: z.string().describe('The topic to retrieve test questions for.'),
    count: z.number().describe('The maximum number of test questions to retrieve.'),
  }),
  outputSchema: z.array(TestQuestionSchema).describe('An array of test questions for the given topic.'),
}, async (input) => {
  // TODO: Implement the logic to retrieve test questions from the database.
  // This is a placeholder implementation.
  return [
    {question: `Test Question 1 for ${input.topic}`, answer: `Correct Answer 1 for ${input.topic}`, options: [`Option 1`, `Option 2`, `Correct Answer 1 for ${input.topic}`], topic: input.topic},
    {question: `Test Question 2 for ${input.topic}`, answer: `Correct Answer 2 for ${input.topic}`, options: [`Option 1`, `Option 2`, `Correct Answer 2 for ${input.topic}`], topic: input.topic},
  ].slice(0, input.count);
});

const intelligentReviewFlow = ai.defineFlow({
    name: 'intelligentReviewFlow',
    inputSchema: IntelligentReviewInputSchema,
    outputSchema: IntelligentReviewOutputSchema,
  }, async (input) => {
    const performanceData = await getPerformanceData({userId: input.userId});

    // Sort topics by performance in ascending order (lowest performance first).
    const sortedTopics = Object.entries(performanceData)
      .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
      .map(([topic]) => topic);

    const flashcards = [];
    const testQuestions = [];

    // Iterate through topics with the lowest performance and retrieve flashcards and test questions.
    for (const topic of sortedTopics) {
      if (flashcards.length < input.numFlashcards) {
        const numToFetch = input.numFlashcards - flashcards.length;
        const topicFlashcards = await getFlashcardsByTopic({topic: topic, count: numToFetch});
        flashcards.push(...topicFlashcards);
      }

      if (testQuestions.length < input.numTestQuestions) {
        const numToFetch = input.numTestQuestions - testQuestions.length;
        const topicTestQuestions = await getTestQuestionsByTopic({topic: topic, count: numToFetch});
        testQuestions.push(...topicTestQuestions);
      }

      if (flashcards.length >= input.numFlashcards && testQuestions.length >= input.numTestQuestions) {
        break;
      }
    }

    return {
      flashcards: flashcards,
      testQuestions: testQuestions,
    };
  }
);
