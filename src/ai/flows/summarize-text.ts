'use server';

/**
 * @fileOverview A text summarization AI agent.
 *
 * - summarizeText - A function that handles the text summarization process.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text to summarize.'),
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'The detailed, markdown-formatted summary of the input text, including emojis and bullet points.'
    ),
  progress: z
    .string()
    .describe('A short, one-sentence summary of the summarization process.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

export async function summarizeText(
  input: SummarizeTextInput
): Promise<SummarizeTextOutput> {
  return summarizeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: SummarizeTextInputSchema},
  output: {schema: SummarizeTextOutputSchema},
  prompt: `You are an expert educational writer who creates engaging, detailed, and easy-to-understand summaries from text.

  Your task is to generate a comprehensive summary of the provided text. The summary must be:
  - **Elaborated:** Go beyond a simple, short summary. Capture the nuances and main arguments of the text.
  - **Well-Structured:** Use markdown for formatting, including headers and bullet points (using '*') to organize information logically.
  - **Engaging:** Incorporate relevant emojis to highlight key sections and make the content more visually appealing and memorable.
  - **Complete:** Ensure all critical concepts, key points, and important details from the original text are included. Do not leave out important information.

  Here is the text to summarize:
  {{{text}}}`,
});

const summarizeTextFlow = ai.defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      summary: output!.summary,
      progress: 'AI generated a detailed summary of the input text.',
    };
  }
);
