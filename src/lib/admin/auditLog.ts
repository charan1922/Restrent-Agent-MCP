// Simple in‑memory audit log for the admin system
export interface AuditLogEntry {
  action: string;
  tenantId?: string;
  mode?: string;
  timestamp: number;
  user?: string; // optional parent user identifier
}

const logs: AuditLogEntry[] = [];

export function addAuditLog(entry: AuditLogEntry) {
  logs.push(entry);
  // In a real app you would persist to a DB or external log service
}

export function getAuditLogs(): AuditLogEntry[] {
  // Return a copy to avoid external mutation
  return [...logs].reverse(); // newest first
}
