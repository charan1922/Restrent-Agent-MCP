import { pgTable, text, integer, timestamp, boolean, decimal, jsonb, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Restaurant Tables (Physical Tables in Restaurant)
 */
export const tables = pgTable("tables", {
  id: text("id").primaryKey(), // T1, T2, T3, etc.
  capacity: integer("capacity").notNull(),
  status: text("status").notNull().default("available"), // available, seated, reserved, dirty
  currentReservationId: text("current_reservation_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Reservations
 */
export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  partySize: integer("party_size").notNull(),
  dateTime: timestamp("date_time").notNull(),
  tableId: text("table_id").references(() => tables.id),
  status: text("status").notNull().default("pending"), // pending, confirmed, seated, completed, cancelled
  contactInfo: text("contact_info"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Menu Items
 */
export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // appetizers, mains, breads, beverages, desserts
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  ingredients: jsonb("ingredients").$type<string[]>().notNull(),
  allergens: jsonb("allergens").$type<string[]>().notNull(),
  spiceLevel: integer("spice_level").notNull().default(0), // 0-3
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isVegan: boolean("is_vegan").notNull().default(false),
  prepTime: integer("prep_time").notNull(), // minutes
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Orders
 */
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  tableId: text("table_id").references(() => tables.id).notNull(),
  items: jsonb("items").$type<Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    modifications?: string[];
    specialInstructions?: string;
  }>>().notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, sent_to_chef, preparing, ready, served, paid, cancelled
  chefOrderId: text("chef_order_id"), // ID from Chef Agent via A2A
  eta: integer("eta"), // ETA in minutes from Chef
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Payments
 */
export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).notNull().default("0.18"), // 18% GST
  method: text("method").notNull(), // cash, credit, debit, upi
  status: text("status").notNull().default("pending"), // pending, completed, failed
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Conversations (Chat History for Memory)
 */
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id"), // Optional: for user identification
  guestName: text("guest_name"),
  messages: jsonb("messages").$type<Array<{
    role: string;
    content: string;
    toolCalls?: any;
    timestamp: string;
  }>>().notNull(),
  summary: text("summary"), // AI-generated summary for quick recall
  orderIds: jsonb("order_ids").$type<string[]>(), // Track orders from this conversation
  reservationIds: jsonb("reservation_ids").$type<string[]>(), // Track reservations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
});

/**
 * Analytics & Insights
 */
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // order_placed, payment_completed, reservation_made, etc.
  eventData: jsonb("event_data").notNull(),
  userId: text("user_id"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Relations
 */
export const ordersRelations = relations(orders, ({ one }) => ({
  payment: one(payments, {
    fields: [orders.id],
    references: [payments.orderId],
  }),
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  table: one(tables, {
    fields: [reservations.tableId],
    references: [tables.id],
  }),
}));
