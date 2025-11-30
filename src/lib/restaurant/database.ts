/**
 * In-Memory Restaurant Database
 * Handles tables, reservations, and orders
 * For production, migrate to Drizzle ORM with Neon PostgreSQL
 */

export type TableStatus = "available" | "seated" | "reserved" | "dirty";

export interface Table {
  id: string;
  capacity: number;
  status: TableStatus;
  currentReservationId?: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  partySize: number;
  dateTime: Date;
  tableId?: string;
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled";
  contactInfo?: string;
  specialRequests?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    modifications?: string[];
    specialInstructions?: string;
  }>;
  total: number;
  status: "pending" | "sent_to_chef" | "preparing" | "ready" | "served" | "paid" | "cancelled";
  chefOrderId?: string; // ID from Chef Agent
  timestamp: Date;
  eta?: number; // ETA in minutes from Chef
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: "cash" | "credit" | "debit" | "upi";
  status: "pending" | "completed" | "failed";
  timestamp: Date;
}

/**
 * Restaurant Database
 */
class RestaurantDatabase {
  private tables: Map<string, Table> = new Map();
  private reservations: Map<string, Reservation> = new Map();
  private orders: Map<string, Order> = new Map();
  private payments: Map<string, Payment> = new Map();

  constructor() {
    this.initializeTables();
  }

  /**
   * Initialize restaurant tables
   */
  private initializeTables() {
    const tableDefs = [
      { id: "T1", capacity: 2 },
      { id: "T2", capacity: 2 },
      { id: "T3", capacity: 4 },
      { id: "T4", capacity: 4 },
      { id: "T5", capacity: 6 },
      { id: "T6", capacity: 6 },
      { id: "T7", capacity: 8 },
    ];

    tableDefs.forEach((def) => {
      this.tables.set(def.id, {
        id: def.id,
        capacity: def.capacity,
        status: "available",
      });
    });
  }

  // ============================================================================
  // Table Management
  // ============================================================================

  getAllTables(): Table[] {
    return Array.from(this.tables.values());
  }

  getTable(tableId: string): Table | undefined {
    return this.tables.get(tableId);
  }

  updateTableStatus(tableId: string, status: TableStatus): void {
    const table = this.tables.get(tableId);
    if (table) {
      table.status = status;
      this.tables.set(tableId, table);
    }
  }

  getAvailableTables(minCapacity: number): Table[] {
    return Array.from(this.tables.values()).filter(
      (table) => table.status === "available" && table.capacity >= minCapacity
    );
  }

  // ============================================================================
  // Reservation Management
  // ============================================================================

  createReservation(reservation: Omit<Reservation, "id">): Reservation {
    const id = `RES-${Date.now()}`;
    const newReservation: Reservation = { ...reservation, id };
    this.reservations.set(id, newReservation);
    return newReservation;
  }

  getReservation(reservationId: string): Reservation | undefined {
    return this.reservations.get(reservationId);
  }

  updateReservation(reservationId: string, updates: Partial<Reservation>): Reservation | undefined {
    const reservation = this.reservations.get(reservationId);
    if (reservation) {
      const updated = { ...reservation, ...updates };
      this.reservations.set(reservationId, updated);
      return updated;
    }
    return undefined;
  }

  getAllReservations(): Reservation[] {
    return Array.from(this.reservations.values());
  }

  getReservationsByDate(date: Date): Reservation[] {
    return Array.from(this.reservations.values()).filter((res) => {
      const resDate = new Date(res.dateTime);
      return (
        resDate.getFullYear() === date.getFullYear() &&
        resDate.getMonth() === date.getMonth() &&
        resDate.getDate() === date.getDate()
      );
    });
  }

  // ============================================================================
  // Order Management
  // ============================================================================

  createOrder(order: Omit<Order, "id">): Order {
    const id = `ORD-${Date.now()}`;
    const newOrder: Order = { ...order, id };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  updateOrder(orderId: string, updates: Partial<Order>): Order | undefined {
    const order = this.orders.get(orderId);
    if (order) {
      const updated = { ...order, ...updates };
      this.orders.set(orderId, updated);
      return updated;
    }
    return undefined;
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  getOrdersByTable(tableId: string): Order[] {
    return Array.from(this.orders.values()).filter(
      (order) => order.tableId === tableId
    );
  }

  getActiveOrders(): Order[] {
    return Array.from(this.orders.values()).filter(
      (order) => !["served", "paid"].includes(order.status)
    );
  }

  // ============================================================================
  // Payment Management
  // ============================================================================

  createPayment(payment: Omit<Payment, "id">): Payment {
    const id = `PAY-${Date.now()}`;
    const newPayment: Payment = { ...payment, id };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  getPayment(paymentId: string): Payment | undefined {
    return this.payments.get(paymentId);
  }

  getPaymentByOrderId(orderId: string): Payment | undefined {
    return Array.from(this.payments.values()).find(
      (payment) => payment.orderId === orderId
    );
  }

  updatePayment(paymentId: string, updates: Partial<Payment>): Payment | undefined {
    const payment = this.payments.get(paymentId);
    if (payment) {
      const updated = { ...payment, ...updates };
      this.payments.set(paymentId, updated);
      return updated;
    }
    return undefined;
  }
}

// Singleton instance
let dbInstance: RestaurantDatabase | null = null;

export function getRestaurantDB(): RestaurantDatabase {
  if (!dbInstance) {
    dbInstance = new RestaurantDatabase();
  }
  return dbInstance;
}
