import { query } from "../db/postgres";

/**
 * Restaurant Repository - Pure SQL, No ORM
 * Simple CRUD operations using pg library
 */

// ============================================================================
// MENU
// ============================================================================

export async function getAllMenuItems(tenantId: string) {
  const result = await query(
    "SELECT * FROM menu_items WHERE tenant_id = $1 AND is_available = TRUE ORDER BY category, name",
    [tenantId]
  );
  return result.rows;
}

export async function getMenuItemById(tenantId: string, id: string) {
  const result = await query("SELECT * FROM menu_items WHERE tenant_id = $1 AND id = $2", [tenantId, id]);
  return result.rows[0];
}

export async function searchMenuByName(tenantId: string, searchTerm: string) {
  const result = await query(
    "SELECT * FROM menu_items WHERE tenant_id = $1 AND LOWER(name) LIKE LOWER($2) AND is_available = TRUE",
    [tenantId, `%${searchTerm}%`]
  );
  return result.rows;
}

export async function getMenuByCategory(tenantId: string, category: string) {
  const result = await query(
    "SELECT * FROM menu_items WHERE tenant_id = $1 AND category = $2 AND is_available = TRUE",
    [tenantId, category]
  );
  return result.rows;
}

export async function getVegetarianItems(tenantId: string) {
  const result = await query(
    "SELECT * FROM menu_items WHERE tenant_id = $1 AND is_vegetarian = TRUE AND is_available = TRUE",
    [tenantId]
  );
  return result.rows;
}

export async function getVeganItems(tenantId: string) {
  const result = await query(
    "SELECT * FROM menu_items WHERE tenant_id = $1 AND is_vegan = TRUE AND is_available = TRUE",
    [tenantId]
  );
  return result.rows;
}

export async function createMenuItem(tenantId: string, data: {
  name: string;
  description: string;
  category: string;
  price: number;
  ingredients: string[];
  allergens: string[];
  spice_level: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  prep_time: number;
  image_url?: string;
}) {
  const id = `${data.category.slice(0, 4)}-${Date.now()}`;
  const result = await query(
    `INSERT INTO menu_items (
      id, tenant_id, name, description, category, price, ingredients, allergens,
      spice_level, is_vegetarian, is_vegan, prep_time, image_url, is_available
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)
    RETURNING *`,
    [
      id,
      tenantId,
      data.name,
      data.description,
      data.category,
      data.price,
      JSON.stringify(data.ingredients),
      JSON.stringify(data.allergens),
      data.spice_level,
      data.is_vegetarian,
      data.is_vegan,
      data.prep_time,
      data.image_url,
    ]
  );
  return result.rows[0];
}

export async function updateMenuItem(tenantId: string, itemId: string, updates: any) {
  const setClause = [];
  const values = [];
  let paramIndex = 1;

  const allowedFields = [
    'name', 'description', 'category', 'price', 'ingredients', 'allergens',
    'spice_level', 'is_vegetarian', 'is_vegan', 'prep_time', 'image_url', 'is_available'
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClause.push(`${field} = $${paramIndex++}`);
      // JSON fields need stringification
      if (field === 'ingredients' || field === 'allergens') {
        values.push(JSON.stringify(updates[field]));
      } else {
        values.push(updates[field]);
      }
    }
  }

  if (setClause.length === 0) {
    throw new Error("No valid fields to update");
  }

  setClause.push(`updated_at = NOW()`);
  values.push(tenantId);
  values.push(itemId);

  const result = await query(
    `UPDATE menu_items SET ${setClause.join(", ")} 
     WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1} 
     RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteMenuItem(tenantId: string, itemId: string) {
  await query(
    "DELETE FROM menu_items WHERE tenant_id = $1 AND id = $2",
    [tenantId, itemId]
  );
}

export async function toggleMenuItemAvailability(tenantId: string, itemId: string) {
  const result = await query(
    `UPDATE menu_items 
     SET is_available = NOT is_available, updated_at = NOW() 
     WHERE tenant_id = $1 AND id = $2 
     RETURNING *`,
    [tenantId, itemId]
  );
  return result.rows[0];
}

// ============================================================================
// MENU CATEGORIES
// ============================================================================

export async function getMenuCategories(tenantId: string) {
  const result = await query(
    "SELECT * FROM menu_categories WHERE tenant_id = $1 AND is_active = TRUE ORDER BY display_order, name",
    [tenantId]
  );
  return result.rows;
}

export async function createMenuCategory(tenantId: string, name: string, displayOrder?: number) {
  const id = `cat-${Date.now()}`;
  const result = await query(
    "INSERT INTO menu_categories (id, tenant_id, name, display_order) VALUES ($1, $2, $3, $4) RETURNING *",
    [id, tenantId, name, displayOrder || 0]
  );
  return result.rows[0];
}


// ============================================================================
// ORDERS
// ============================================================================

export async function createOrder(tenantId: string, orderData: {
  tableId: string;
  items: any[];
  total: number;
  status?: string;
  chefOrderId?: string;
  eta?: number;
}) {
  const id = `ORD-${Date.now()}`;
  const result = await query(
    `INSERT INTO orders (id, tenant_id, table_id, items, total, status, chef_order_id, eta)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      tenantId,
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

export async function getOrder(tenantId: string, orderId: string) {
  const result = await query("SELECT * FROM orders WHERE tenant_id = $1 AND id = $2", [tenantId, orderId]);
  return result.rows[0];
}

export async function getOrdersByTable(tenantId: string, tableId: string) {
  const result = await query(
    "SELECT * FROM orders WHERE tenant_id = $1 AND table_id = $2 ORDER BY created_at DESC",
    [tenantId, tableId]
  );
  return result.rows;
}

export async function updateOrder(tenantId: string, orderId: string, updates: any) {
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
  
  // Add tenant_id check for security
  values.push(tenantId);
  values.push(orderId);

  const result = await query(
    `UPDATE orders SET ${setClause.join(", ")} WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1} RETURNING *`,
    values
  );
  return result.rows[0];
}

// ============================================================================
// RESERVATIONS
// ============================================================================

export async function createReservation(tenantId: string, data: {
  guestName: string;
  partySize: number;
  dateTime: Date;
  tableId?: string;
  contactInfo?: string;
  specialRequests?: string;
}) {
  const id = `RES-${Date.now()}`;
  const result = await query(
    `INSERT INTO reservations (id, tenant_id, guest_name, party_size, date_time, table_id, contact_info, special_requests, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     RETURNING *`,
    [
      id,
      tenantId,
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

export async function getReservation(tenantId: string, resId: string) {
  const result = await query("SELECT * FROM reservations WHERE tenant_id = $1 AND id = $2", [tenantId, resId]);
  return result.rows[0];
}

export async function updateReservation(tenantId: string, resId: string, updates: any) {
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
  
  // Add tenant_id check
  values.push(tenantId);
  values.push(resId);

  const result = await query(
    `UPDATE reservations SET ${setClause.join(", ")} WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1} RETURNING *`,
    values
  );
  return result.rows[0];
}

// ============================================================================
// TABLES
// ============================================================================

export async function getAllTables(tenantId: string) {
  const result = await query("SELECT * FROM tables WHERE tenant_id = $1 ORDER BY id", [tenantId]);
  return result.rows;
}

export async function getTable(tableId: string) {
  const result = await query("SELECT * FROM tables WHERE id = $1", [tableId]);
  return result.rows[0];
}

export async function updateTableStatus(tenantId: string, tableId: string, status: string) {
  await query(
    "UPDATE tables SET status = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3",
    [status, tenantId, tableId]
  );
}

export async function getAvailableTables(tenantId: string, minCapacity: number) {
  const result = await query(
    "SELECT * FROM tables WHERE tenant_id = $1 AND status = 'available' AND capacity >= $2 ORDER BY capacity",
    [tenantId, minCapacity]
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

// ============================================================================
// SETTINGS
// ============================================================================

export async function getSetting(tenantId: string, key: string) {
  const result = await query(
    "SELECT value FROM settings WHERE tenant_id = $1 AND key = $2",
    [tenantId, key]
  );
  return result.rows[0]?.value;
}

export async function getSystemPrompt(tenantId: string) {
  const customPrompt = await getSetting(tenantId, "system_prompt");
  if (customPrompt) return customPrompt;
  
  return null;
}
