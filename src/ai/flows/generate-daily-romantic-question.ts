'use server';
/**
 * @fileOverview A Genkit flow for generating a daily romantic question.
 *
 * - generateDailyRomanticQuestion - A function that handles the generation of a romantic question.
 * - GenerateDailyRomanticQuestionInput - The input type for the generateDailyRomanticQuestion function.
 * - GenerateDailyRomanticQuestionOutput - The return type for the generateDailyRomanticQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyRomanticQuestionInputSchema = z.void();
export type GenerateDailyRomanticQuestionInput = z.infer<typeof GenerateDailyRomanticQuestionInputSchema>;

const GenerateDailyRomanticQuestionOutputSchema = z.object({
  question: z.string().describe('A romantic question for couples to discuss.'),
});
export type GenerateDailyRomanticQuestionOutput = z.infer<typeof GenerateDailyRomanticQuestionOutputSchema>;

const generateQuestionPrompt = ai.definePrompt({
  name: 'generateDailyRomanticQuestionPrompt',
  input: {schema: GenerateDailyRomanticQuestionInputSchema},
  output: {schema: GenerateDailyRomanticQuestionOutputSchema},
  prompt: `You are an AI assistant designed to generate thoughtful and romantic questions for couples.

Your task is to provide a single, engaging question that encourages deep conversation and strengthens their connection. The question should be positive, introspective, and suitable for daily reflection.

Generate one romantic question. Do not include any introductory or concluding remarks, just the question itself, formatted as the 'question' field in the JSON output.`,
});

const generateDailyRomanticQuestionFlow = ai.defineFlow(
  {
    name: 'generateDailyRomanticQuestionFlow',
    inputSchema: GenerateDailyRomanticQuestionInputSchema,
    outputSchema: GenerateDailyRomanticQuestionOutputSchema,
  },
  async () => {
    const {output} = await generateQuestionPrompt({});
    return output!;
  }
);

export async function generateDailyRomanticQuestion(): Promise<GenerateDailyRomanticQuestionOutput> {
  return generateDailyRomanticQuestionFlow();
}
