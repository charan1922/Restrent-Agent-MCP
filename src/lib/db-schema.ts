import { pgTable, serial, text, vector, index } from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }), // google -> text-embedding-004
  },
  (table) => [
    index("embeddingIndex").using(
      "hnsw", // hierarchical navicable small world
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;
