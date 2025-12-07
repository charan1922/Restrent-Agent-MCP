import { query } from "../db/postgres";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // 7 days

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  role: string;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
}

// ============================================================================
// USER AUTH FUNCTIONS
// ============================================================================

export async function registerUser(
  tenantId: string,
  name: string,
  phone: string,
  password: string
): Promise<{ user: User; token: string }> {
  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const userId = `user-${uuidv4()}`;
  const result = await query(
    `INSERT INTO users (id, tenant_id, name, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, tenant_id, name, phone, role, created_at`,
    [userId, tenantId, name, phone, passwordHash, "user"]
  );

  const user = result.rows[0];

  // Create session
  const { token } = await createSession(user.id);

  return { user, token };
}

export async function loginUser(
  tenantId: string,
  phone: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  // Find user
  const result = await query(
    `SELECT * FROM users WHERE tenant_id = $1 AND phone = $2`,
    [tenantId, phone]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  // Create session
  const { token } = await createSession(user.id);

  // Return user without password hash
  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function createSession(userId: string): Promise<Session> {
  const sessionId = `session-${uuidv4()}`;
  const token = jwt.sign({ userId, sessionId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const result = await query(
    `INSERT INTO sessions (id, user_id, token, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [sessionId, userId, token, expiresAt]
  );

  return result.rows[0];
}

export async function validateSession(token: string): Promise<User | null> {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      sessionId: string;
    };

    // Check session in database
    const sessionResult = await query(
      `SELECT * FROM sessions WHERE id = $1 AND token = $2 AND expires_at > NOW()`,
      [decoded.sessionId, token]
    );

    if (sessionResult.rows.length === 0) {
      return null;
    }

    // Get user
    const userResult = await query(
      `SELECT id, tenant_id, name, phone, role, created_at FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    return userResult.rows[0];
  } catch (error) {
    // Silently reject invalid tokens (expected for cross-tenant access)
    // Only log unexpected errors
    if (error instanceof Error && !error.message.includes('jwt')) {
      console.error("Session validation error:", error);
    }
    return null;
  }
}

export async function logoutUser(token: string): Promise<boolean> {
  try {
    const result = await query(`DELETE FROM sessions WHERE token = $1`, [
      token,
    ]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await query(
    `SELECT id, tenant_id, name, phone, role, created_at FROM users WHERE id = $1`,
    [userId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

// Clean up expired sessions (should be run periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await query(`DELETE FROM sessions WHERE expires_at < NOW()`);
}
