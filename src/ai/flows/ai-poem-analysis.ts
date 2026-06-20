'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing poems.
 *
 * - analyzePoem - A function that generates a thematic analysis and emotional summary for a given poem.
 * - AnalyzePoemInput - The input type for the analyzePoem function.
 * - AnalyzePoemOutput - The return type for the analyzePoem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePoemInputSchema = z.object({
  title: z.string().describe('The title of the poem.'),
  poemText: z.string().describe('The full text of the poem.'),
});
export type AnalyzePoemInput = z.infer<typeof AnalyzePoemInputSchema>;

const AnalyzePoemOutputSchema = z.object({
  thematicAnalysis: z
    .string()
    .describe('A concise thematic analysis of the poem.'),
  emotionalSummary: z
    .string()
    .describe('A summary of the emotional tone and impact of the poem.'),
});
export type AnalyzePoemOutput = z.infer<typeof AnalyzePoemOutputSchema>;

export async function analyzePoem(
  input: AnalyzePoemInput
): Promise<AnalyzePoemOutput> {
  return analyzePoemFlow(input);
}

const analyzePoemPrompt = ai.definePrompt({
  name: 'analyzePoemPrompt',
  input: { schema: AnalyzePoemInputSchema },
  output: { schema: AnalyzePoemOutputSchema },
  prompt: `You are an expert literary critic specializing in poetry analysis. Your task is to provide a concise thematic analysis and an emotional summary for the given poem.

Poem Title: {{{title}}}

Poem Text:
{{{poemText}}}

Based on the poem above, please provide:

1. A concise thematic analysis: Identify and explain the main themes, recurring motifs, and deeper meanings conveyed by the poem.
2. An emotional summary: Describe the overall emotional tone, mood, and the feelings evoked by the poem.`,
});

const analyzePoemFlow = ai.defineFlow(
  {
    name: 'analyzePoemFlow',
    inputSchema: AnalyzePoemInputSchema,
    outputSchema: AnalyzePoemOutputSchema,
  },
  async (input) => {
    const { output } = await analyzePoemPrompt(input);
    return output!;
  }
);
