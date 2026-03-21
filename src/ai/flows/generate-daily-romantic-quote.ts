'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a daily romantic quote.
 *
 * - generateDailyRomanticQuote - A function that handles the generation of a romantic quote.
 * - GenerateDailyRomanticQuoteInput - The input type for the generateDailyRomanticQuote function.
 * - GenerateDailyRomanticQuoteOutput - The return type for the generateDailyRomanticQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyRomanticQuoteInputSchema = z
  .object({})
  .describe('Input for generating a daily romantic quote, currently empty as no specific input is required.');
export type GenerateDailyRomanticQuoteInput = z.infer<typeof GenerateDailyRomanticQuoteInputSchema>;

const GenerateDailyRomanticQuoteOutputSchema = z
  .object({
    quote: z.string().describe('An inspiring and romantic quote.'),
    author: z
      .string()
      .optional()
      .describe('The author of the quote, if applicable. If not, state "Anonymous" or "AI".'),
  })
  .describe('Output containing a romantic quote and its author.');
export type GenerateDailyRomanticQuoteOutput = z.infer<typeof GenerateDailyRomanticQuoteOutputSchema>;

/**
 * Generates a unique, inspiring, and deeply romantic quote suitable for a couple.
 * The quote evokes feelings of love, connection, and appreciation.
 *
 * @param input - Empty object as no specific input is required.
 * @returns A promise that resolves to an object containing the romantic quote and its author.
 */
export async function generateDailyRomanticQuote(
  input: GenerateDailyRomanticQuoteInput
): Promise<GenerateDailyRomanticQuoteOutput> {
  return generateDailyRomanticQuoteFlow(input);
}

const generateDailyRomanticQuotePrompt = ai.definePrompt({
  name: 'generateDailyRomanticQuotePrompt',
  input: {schema: GenerateDailyRomanticQuoteInputSchema},
  output: {schema: GenerateDailyRomanticQuoteOutputSchema},
  prompt: `Generate a unique, inspiring, and deeply romantic quote suitable for a couple. The quote should evoke feelings of love, connection, and appreciation. It should be relatively short and impactful.

Output in JSON format with two fields: 'quote' for the quote text and 'author' for the quote's author. If a specific author does not come to mind, use 'Anonymous' or 'AI' as the author.`,
});

const generateDailyRomanticQuoteFlow = ai.defineFlow(
  {
    name: 'generateDailyRomanticQuoteFlow',
    inputSchema: GenerateDailyRomanticQuoteInputSchema,
    outputSchema: GenerateDailyRomanticQuoteOutputSchema,
  },
  async input => {
    const {output} = await generateDailyRomanticQuotePrompt(input);
    return output!;
  }
);
