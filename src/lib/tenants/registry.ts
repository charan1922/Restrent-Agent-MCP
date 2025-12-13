export interface Tenant {
  id: string;
  name: string;
  host: string;
}

export const TENANTS: Tenant[] = [
  {
    id: "chutneys",
    name: "Chutney's Kitchen",
    host: "chutneys.waiter.local:4444",
  },
  {
    id: "pistahouse",
    name: "Pista House",
    host: "pistahouse.waiter.local:4444",
  },
];

export const getTenantFromHost = (host: string): Tenant | undefined =>
  TENANTS.find((t) => t.host === host);
