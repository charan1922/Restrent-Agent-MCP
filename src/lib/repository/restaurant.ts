import { query } from "../db/postgres";

/**
 * Restaurant Repository - Pure SQL, No ORM
 * Simple CRUD operations using pg library
 */

// ============================================================================
// MENU
// ============================================================================

export async function getAllMenuItems() {
  const result = await query(
    "SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, name"
  );
  return result.rows;
}

export async function getMenuItemById(id: string) {
  const result = await query("SELECT * FROM menu_items WHERE id = $1", [id]);
  return result.rows[0];
}

export async function searchMenuByName(searchTerm: string) {
  const result = await query(
    "SELECT * FROM menu_items WHERE LOWER(name) LIKE LOWER($1) AND is_available = TRUE",
    [`%${searchTerm}%`]
  );
  return result.rows;
}

export async function getMenuByCategory(category: string) {
  const result = await query(
    "SELECT * FROM menu_items WHERE category = $1 AND is_available = TRUE",
    [category]
  );
  return result.rows;
}

export async function getVegetarianItems() {
  const result = await query(
    "SELECT * FROM menu_items WHERE is_vegetarian = TRUE AND is_available = TRUE"
  );
  return result.rows;
}

export async function getVeganItems() {
  const result = await query(
    "SELECT * FROM menu_items WHERE is_vegan = TRUE AND is_available = TRUE"
  );
  return result.rows;
}

// ============================================================================
// ORDERS
// ============================================================================

export async function createOrder(orderData: {
  tableId: string;
  items: any[];
  total: number;
  status?: string;
  chefOrderId?: string;
  eta?: number;
}) {
  const id = `ORD-${Date.now()}`;
  const result = await query(
    `INSERT INTO orders (id, table_id, items, total, status, chef_order_id, eta)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      id,
      orderData.tableId,
      JSON.stringify(orderData.items),
      orderData.total,
      orderData.status || "pending",
      orderData.chefOrderId,
      orderData.eta,
    ]
  );
  return result.rows[0];
}

export async function getOrder(orderId: string) {
  const result = await query("SELECT * FROM orders WHERE id = $1", [orderId]);
  return result.rows[0];
}

export async function getOrdersByTable(tableId: string) {
  const result = await query(
    "SELECT * FROM orders WHERE table_id = $1 ORDER BY created_at DESC",
    [tableId]
  );
  return result.rows;
}

export async function updateOrder(orderId: string, updates: any) {
  const setClause = [];
  const values = [];
  let paramIndex = 1;

  if (updates.status !== undefined) {
    setClause.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.chefOrderId !== undefined) {
    setClause.push(`chef_order_id = $${paramIndex++}`);
    values.push(updates.chefOrderId);
  }
  if (updates.eta !== undefined) {
    setClause.push(`eta = $${paramIndex++}`);
    values.push(updates.eta);
  }
  if (updates.items !== undefined) {
    setClause.push(`items = $${paramIndex++}`);
    values.push(JSON.stringify(updates.items));
  }
  if (updates.total !== undefined) {
    setClause.push(`total = $${paramIndex++}`);
    values.push(updates.total);
  }

  setClause.push(`updated_at = NOW()`);
  values.push(orderId);

  const result = await query(
    `UPDATE orders SET ${setClause.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
}

// ============================================================================
// RESERVATIONS
// ============================================================================

export async function createReservation(data: {
  guestName: string;
  partySize: number;
  dateTime: Date;
  tableId?: string;
  contactInfo?: string;
  specialRequests?: string;
}) {
  const id = `RES-${Date.now()}`;
  const result = await query(
    `INSERT INTO reservations (id, guest_name, party_size, date_time, table_id, contact_info, special_requests, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
     RETURNING *`,
    [
      id,
      data.guestName,
      data.partySize,
      data.dateTime,
      data.tableId,
      data.contactInfo,
      data.specialRequests,
    ]
  );
  return result.rows[0];
}

export async function getReservation(resId: string) {
  const result = await query("SELECT * FROM reservations WHERE id = $1", [resId]);
  return result.rows[0];
}

export async function updateReservation(resId: string, updates: any) {
  const setClause = [];
  const values = [];
  let paramIndex = 1;

  if (updates.status) {
    setClause.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.tableId) {
    setClause.push(`table_id = $${paramIndex++}`);
    values.push(updates.tableId);
  }

  setClause.push(`updated_at = NOW()`);
  values.push(resId);

  const result = await query(
    `UPDATE reservations SET ${setClause.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
}

// ============================================================================
// TABLES
// ============================================================================

export async function getAllTables() {
  const result = await query("SELECT * FROM tables ORDER BY id");
  return result.rows;
}

export async function getTable(tableId: string) {
  const result = await query("SELECT * FROM tables WHERE id = $1", [tableId]);
  return result.rows[0];
}

export async function updateTableStatus(tableId: string, status: string) {
  await query(
    "UPDATE tables SET status = $1, updated_at = NOW() WHERE id = $2",
    [status, tableId]
  );
}

export async function getAvailableTables(minCapacity: number) {
  const result = await query(
    "SELECT * FROM tables WHERE status = 'available' AND capacity >= $1 ORDER BY capacity",
    [minCapacity]
  );
  return result.rows;
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function createPayment(data: {
  orderId: string;
  amount: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  method: string;
  transactionId?: string;
}) {
  const id = `PAY-${Date.now()}`;
  const result = await query(
    `INSERT INTO payments (id, order_id, amount, subtotal, tax, tax_rate, method, transaction_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
     RETURNING *`,
    [
      id,
      data.orderId,
      data.amount,
      data.subtotal,
      data.tax,
      data.taxRate,
      data.method,
      data.transactionId,
    ]
  );
  return result.rows[0];
}

export async function getPaymentByOrderId(orderId: string) {
  const result = await query(
    "SELECT * FROM payments WHERE order_id = $1",
    [orderId]
  );
  return result.rows[0];
}

// ============================================================================
// CONVERSATIONS (for chat memory)
// ============================================================================

export async function saveConversation(data: {
  id?: string;
  userId?: string;
  guestName?: string;
  messages: any[];
  summary?: string;
  orderIds?: string[];
  reservationIds?: string[];
}) {
  const id = data.id || `CONV-${Date.now()}`;
  
  const result = await query(
    `INSERT INTO conversations (id, user_id, guest_name, messages, summary, order_ids, reservation_ids, last_message_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (id) DO UPDATE SET
       messages = $4,
       summary = $5,
       order_ids = $6,
       reservation_ids = $7,
       updated_at = NOW(),
       last_message_at = NOW()
     RETURNING *`,
    [
      id,
      data.userId,
      data.guestName,
      JSON.stringify(data.messages),
      data.summary,
      JSON.stringify(data.orderIds || []),
      JSON.stringify(data.reservationIds || []),
    ]
  );
  return result.rows[0];
}

export async function getConversation(convId: string) {
  const result = await query(
    "SELECT * FROM conversations WHERE id = $1",
    [convId]
  );
  return result.rows[0];
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function logEvent(eventType: string, eventData: any, userId?: string, sessionId?: string) {
  await query(
    "INSERT INTO analytics (event_type, event_data, user_id, session_id) VALUES ($1, $2, $3, $4)",
    [eventType, JSON.stringify(eventData), userId, sessionId]
  );
}
