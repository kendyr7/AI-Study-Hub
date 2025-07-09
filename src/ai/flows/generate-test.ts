// src/ai/flows/generate-test.ts
'use server';
/**
 * @fileOverview Generates multiple choice and true/false questions from a block of text.
 *
 * - generateTestQuestions - A function that generates test questions from text.
 * - GenerateTestQuestionsInput - The input type for the generateTestQuestions function.
 * - GenerateTestQuestionsOutput - The return type for the generateTestQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestQuestionsInputSchema = z.object({
  text: z.string().describe('The text to generate test questions from.'),
});
export type GenerateTestQuestionsInput = z.infer<typeof GenerateTestQuestionsInputSchema>;

const GenerateTestQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      type: z.enum(['multiple_choice', 'true_false']),
      question: z.string(),
      options: z.optional(z.array(z.string())), // Only for multiple choice
      answer: z.string(), // The correct answer (option or true/false)
    })
  ),
});
export type GenerateTestQuestionsOutput = z.infer<typeof GenerateTestQuestionsOutputSchema>;

export async function generateTestQuestions(input: GenerateTestQuestionsInput): Promise<GenerateTestQuestionsOutput> {
  return generateTestQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestQuestionsPrompt',
  input: {schema: GenerateTestQuestionsInputSchema},
  output: {schema: GenerateTestQuestionsOutputSchema},
  prompt: `You are an expert test question generator.  Given a block of text, generate a set of multiple choice and true/false questions to test the user's knowledge of the material.

  The output should be a JSON array of question objects, with each question object having the following schema:
  {
    type: 'multiple_choice' | 'true_false',
    question: string, // The question itself
    options?: string[], // Only for multiple choice questions, the possible answers
    answer: string // The correct answer.  For multiple choice, it's one of the options.  For true_false, it's 'true' or 'false'
  }

  Text: {{{text}}}
  `,
});

const generateTestQuestionsFlow = ai.defineFlow(
  {
    name: 'generateTestQuestionsFlow',
    inputSchema: GenerateTestQuestionsInputSchema,
    outputSchema: GenerateTestQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
