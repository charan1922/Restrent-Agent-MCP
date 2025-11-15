import { embed, embedMany } from "ai";
import { vertex } from "@ai-sdk/google-vertex";

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.replaceAll("\n", " ");

  const { embedding } = await embed({
    model: vertex.textEmbeddingModel("text-embedding-004"),
    value: input,
    providerOptions: {
      google: {
        taskType: "SEMANTIC_SIMILARITY",
        outputDimensionality: 768, // Optional
      },
    },
  });

  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const inputs = texts.map((text) => text.replaceAll("\n", " "));

  const { embeddings } = await embedMany({
    model: vertex.textEmbeddingModel("text-embedding-004"),
    values: inputs,
    providerOptions: {
      google: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    },
  });

  return embeddings;
}
