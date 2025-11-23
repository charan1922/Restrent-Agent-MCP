import {
  pgTable,
  serial,
  text,
  vector,
  index,
  varchar,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

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

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  guestName: varchar("guest_name", { length: 100 }).notNull(),
  partySize: integer("party_size").notNull(),
  dateTime: timestamp("date_time").notNull(),
  tableNumber: integer("table_number"),
  status: varchar("status", { length: 20 }).default("confirmed"), // confirmed, seated, cancelled, completed
  specialRequests: text("special_requests"),
  contactInfo: varchar("contact_info", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number").unique().notNull(),
  capacity: integer("capacity").notNull(),
  status: varchar("status", { length: 20 }).default("available"), // available, occupied, reserved, dirty
  currentGuests: integer("current_guests").default(0),
  serverId: varchar("server_id", { length: 50 }),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number"),
  reservationId: integer("reservation_id").references(() => reservations.id),
  customerName: varchar("customer_name", { length: 100 }),
  items: jsonb("items").notNull(), // Array of order items with modifications
  status: varchar("status", { length: 20 }).default("placed"), // placed, confirmed, preparing, ready, served
  totalAmount: integer("total_amount"), // in cents
  specialInstructions: text("special_instructions"),
  estimatedTime: integer("estimated_time"), // minutes
  allergyAlerts: jsonb("allergy_alerts"), // Array of allergy information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
export type SelectReservation = typeof reservations.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;
export type InsertTable = typeof tables.$inferInsert;
export type SelectTable = typeof tables.$inferSelect;
