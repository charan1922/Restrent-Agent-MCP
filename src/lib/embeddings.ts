import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.replaceAll("\n", " ");

  const { embedding } = await embed({
    model: google.textEmbedding("text-embedding-004"),
    value: input,
  });

  return embedding;
}

// export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
//   const inputs = texts.map((text) => text.replaceAll("\n", " "));

//   const { embeddings } = await embedMany({
//     model: google.textEmbedding("text-embedding-004"),
//     values: inputs,
//   });

//   return embeddings;
// }

export async function generateEmbeddings(texts: string[]) {
  const inputs = texts.map((text) => text.replaceAll("\n", " "));

  // Batch size limit
  const BATCH_SIZE = 100;
  const allEmbeddings = [];

  // Process in batches
  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = inputs.slice(i, i + BATCH_SIZE);

    try {
      const { embeddings } = await embedMany({
        model: google.textEmbedding("text-embedding-004"),
        values: batch, // ✅ Max 100 per batch
      });

      allEmbeddings.push(...embeddings);
    } catch (error) {
      console.error(`Error generating embeddings for batch ${i}:`, error);
      throw error;
    }
  }

  return allEmbeddings;
}