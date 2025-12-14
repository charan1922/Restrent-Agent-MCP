# 🚀 Deployment Guide: Waiter & Chef Agents

This guide covers deploying the **Multi-Tenant AI Restaurant System** to Vercel.

The system consists of two separate Next.js applications:
1. **Waiter Agent** (Customer Facing + Admin)
2. **Chef Agent** (Kitchen Display System)

---

## 📋 Prerequisites

1. **Vercel Account**: [Sign up here](https://vercel.com/signup)
2. **PostgreSQL Database**:
   - Recommended: [Neon](https://neon.tech) (Serverless Postgres) or [Supabase](https://supabase.com)
   - Do NOT use a local database.
3. **Google AI API Key**: [Get it here](https://aistudio.google.com/)

---

## 🛠️ Step 1: Prepare Database

1. Create a new project in Neon/Supabase.
2. Get the connection string (e.g., `postgres://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require`).
3. Run the schema migration scripts in your cloud database query editor:
   - `src/lib/db/schema.sql` (from Waiter Agent)
   - `src/lib/db/seed-tenants.sql`
   - `src/lib/db/seed-menu-items.sql`

---

## 🍳 Step 2: Deploy Chef Agent (Kitchen Display)

Deploy this **first** so you have the URL for the Waiter Agent.

1. **Push Code**: Push your `chef-agent` code to a GitHub repository.
2. **Import to Vercel**:
   - Go to Vercel Dashboard -> Add New -> Project.
   - Select the `chef-agent` repo.
3. **Configure Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (or wherever package.json is)
4. **Environment Variables**:
   Add the following variables in Vercel:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `POSTGRES_URL` | Cloud DB Connection String | `postgres://...` |
   | `NODE_ENV` | Environment | `production` |

5. **Deploy**: Click Deploy.
6. **Save Domain**: Note the assigned domain (e.g., `chef-agent-app.vercel.app`).

---

## 🍽️ Step 3: Deploy Waiter Agent

1. **Push Code**: Push your `waiter-agent` code to a GitHub repository.
2. **Import to Vercel**:
   - Select the `waiter-agent` repo.
3. **Environment Variables**:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API Key | `AIzaSy...` |
   | `CHEF_AGENT_URL` | **URL from Step 2** | `https://chef-agent-app.vercel.app` |
   | `POSTGRES_URL` | Same Cloud DB URL | `postgres://...` |
   | `TENANT_ID` | Default Tenant | `tenant-pista-house` |
   | `TENANT_NAME` | Default Name | `Pista House` |

4. **Deploy**: Click Deploy.

---

## 🌐 Step 4: Multi-Tenancy (Custom Domains)

To make multi-tenancy work (e.g., `pistahouse.waiter.com`), you need to configure domains in Vercel.

### 1. Add Domain
In your Vercel Project Settings -> Domains:
- Add `your-domain.com` (e.g., `ai-waiter.vercel.app` or a custom domain).

### 2. Add Wildcard (Optional)
If you own a domain (e.g., `myrestaurant.com`), add `*.myrestaurant.com`.

### 3. Subdomain Mapping
The app automatically detects subdomains.
- `pistahouse.ai-waiter.vercel.app` -> Loads Pista House
- `chutneys.ai-waiter.vercel.app` -> Loads Chutneys

---

## 🔄 Step 5: Verify A2A Communication

1. Open Waiter Agent: `https://waiter-agent-app.vercel.app/agent`
2. Place an order.
3. Open Chef Agent: `https://chef-agent-app.vercel.app/kitchen`
4. The order should appear in real-time (or on refresh).

---

## ⚠️ Troubleshooting

**A2A Connection Failed?**
- Ensure `CHEF_AGENT_URL` in Waiter Agent does **not** have a trailing slash.
- Correct: `https://chef-agent-app.vercel.app`
- Incorrect: `https://chef-agent-app.vercel.app/`

**Database Errors?**
- Ensure both apps are using the **same** `POSTGRES_URL`.
- Ensure SSL is enabled (`?sslmode=require` in connection string).

**CORS Issues?**
- Since A2A is server-to-server (backend-to-backend), CORS is less of an issue, but ensure API routes allow methods.

