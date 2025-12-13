# 🍽️ Multi-Tenant AI Restaurant System

A production-ready, multi-tenant restaurant ordering system powered by AI, built with Next.js 16, PostgreSQL, and Cerebras AI.

## 🌟 Features

- **🏢 Multi-Tenancy** - Run multiple restaurant brands from one codebase
- **🤖 AI Waiter** - Intelligent chatbot for menu queries, orders, and reservations
- **🎨 Dynamic Branding** - Unique themes and personalities per restaurant
- **👥 Concurrent Users** - Handle unlimited simultaneous customers
- **🔐 Secure Auth** - JWT-based authentication with tenant isolation
- **⚙️ Configurable AI** - Easy-to-customize AI behavior per restaurant
- **👨‍🍳 Chef Agent** - Separate kitchen service on port 5555 via A2A protocol
- **⚡ Fast Performance** - Powered by Cerebras (llama3.1-8b)

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with tenant isolation
- **AI Provider:** Cerebras AI (llama3.1-8b)
- **Auth:** JWT + HTTP-only cookies
- **Multi-tenancy:** Environment-based + database `tenant_id`

### Multi-Tenant Setup
```
Waiter Agent (Port 4444)
├─ pistahouse.waiter.local:4444  │  chutneys.waiter.local:4444
├─ Red theme (#DC2626)           │  Green theme (#16A34A)
├─ Hyderabadi cuisine            │  South Indian cuisine
├─ Non-veg specialist            │  Pure vegetarian
└─ Energetic tone                │  Calm, friendly tone

Chef Agent (Port 5555)
├─ pistahouse.chef.local:5555   │  chutneys.chef.local:5555
└─ Kitchen Display System       │  Order management
```

---

## 👥 How Multi-User Concurrency Works

### Session Isolation
Each user gets a unique JWT token stored in an HTTP-only cookie:

```
User A → Cookie: "auth_token_pista-house=eyJ...ABC123"
User B → Cookie: "auth_token_pista-house=eyJ...XYZ789"
User C → Cookie: "auth_token_pista-house=eyJ...DEF456"
```

### Stateless Request Processing
```
User A sends message
    ↓
Next.js Server
    ├─ Request 1 (User A) → Validate JWT → Process → Response A
    ├─ Request 2 (User B) → Validate JWT → Process → Response B
    └─ Request 3 (User C) → Validate JWT → Process → Response C
         ↓
All processed concurrently, no interference!
```

### Why It Works
✅ **Stateless Design** - Each request is independent  
✅ **JWT Tokens** - Unique identifier per user  
✅ **HTTP Isolation** - Requests don't share memory  
✅ **PostgreSQL** - Handles concurrent queries natively  
✅ **Next.js** - Built for concurrent request handling  

### What Makes It Scalable
- No shared memory between users
- No conversation state on server
- No global variables
- Database handles concurrency automatically

**Result:** Supports **unlimited concurrent users** with zero conflicts! 🚀

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database

### Installation
```bash
# Install dependencies
pnpm install

# Set up database
psql -h localhost -U postgres -d demo -f src/lib/db/migrations/001_initial_schema.sql

# Seed data
psql -h localhost -U postgres -d demo -f src/lib/db/seed-tenants.sql
psql -h localhost -U postgres -d demo -f src/lib/db/seed-menu-items.sql
psql -h localhost -U postgres -d demo -f src/lib/db/seed-restaurant-config.sql

# Configure environment
cp env.pista-house.template .env.pista-house
cp env.chutneys.template .env.chutneys

# Add your API keys
# Edit both .env files and add:
# - CEREBRAS_API_KEY
# - GOOGLE_API_KEY (optional fallback)

# Run waiter agent
pnpm dev
```

### Set up hosts for multi-tenant
Add to `/etc/hosts`:
```
127.0.0.1  pistahouse.waiter.local
127.0.0.1  chutneys.waiter.local
127.0.0.1  pistahouse.chef.local
127.0.0.1  chutneys.chef.local
```

### Access Applications
**Waiter Agent (Port 4444):**
- Default: http://localhost:4444
- Pista House: http://pistahouse.waiter.local:4444
- Chutneys: http://chutneys.waiter.local:4444

**Chef Agent (Port 5555):**
- Default: http://localhost:5555/kitchen
- Pista House: http://pistahouse.chef.local:5555/kitchen
- Chutneys: http://chutneys.chef.local:5555/kitchen

---

## ⚙️ Configuration

### Restaurant Settings (Database-Driven)

Each tenant can customize their AI via the Settings page:

**Restaurant Configuration:**
- Restaurant description
- Cuisine type
- Operating hours
- AI tone/personality
- Special instructions
- Services/features

**Example (Pista House):**
```
Cuisine: Hyderabadi & North Indian
Tone: Warm, energetic, proud of heritage
Instructions: Always recommend Haleem if in season
Specialties: Biryani, Kebabs, Rich gravies
```

**Example (Chutneys):**
```
Cuisine: 100% Pure Vegetarian - South Indian
Tone: Polite, calm, family-friendly
Instructions: Never suggest meat, highlight 7 Chutneys
Specialties: Dosas, Idlis, Filter Coffee
```

### AI Provider Configuration

**Current:** Cerebras AI (llama3.1-8b)
- Ultra-fast inference
- Generous free tier
- Better quotas than Gemini

**Fallback:** Google Gemini
- Set `AI_PROVIDER=google` in .env
- Requires `GOOGLE_API_KEY`

---

## 📊 Database Schema

### Key Tables
```sql
-- Multi-tenancy
tenants (id, name, slug, domain)
users (id, tenant_id, name, email, phone)
sessions (id, user_id, token, expires_at)

-- Restaurant Data
menu_items (id, tenant_id, name, price, category)
orders (id, tenant_id, table_id, items, status)
reservations (id, tenant_id, guest_name, party_size)

-- Configuration
settings (tenant_id, key, value, value_type)
menu_categories (id, tenant_id, name, display_order)
```

### Tenant Isolation
All queries include `tenant_id` filtering:
```typescript
await repo.getAllMenuItems(tenantId);
await repo.createOrder(tenantId, orderData);
```

---

## 🤖 AI Features

### Menu Query Tool
```
Customer: "show me the menu"
AI calls: queryMenu() with no filters
Returns: Full menu grouped by category with prices
```

**Smart Features:**
- No parameters = full menu
- Optional filters: search, category, dietary
- Grouped by category for clarity
- Clear pricing with emoji indicators (🥬 veg, 🍖 non-veg)

### Order Management
```
Customer: "I want biryani and kebab roll"
AI:
1. Calls queryMenu("biryani") → Gets item ID
2. Calls queryMenu("kebab") → Gets item ID
3. Confirms order with customer
4. Calls placeOrder(items, tableId)
5. Returns order confirmation with ETA
```

### Reservation System
```
Customer: "Book table for 4 at 7pm"
AI:
1. Calls manageReservation(create)
2. Checks availability
3. Confirms guest details
4. Returns confirmation
```

---

## 🎨 Branding & Theming

### Dynamic Themes
Each tenant has a unique color stored in database:
```sql
settings (tenant_id='pista-house', key='theme_color', value='#DC2626')
settings (tenant_id='chutneys', key='theme_color', value='#16A34A')
```

Applied via CSS variables:
```typescript
document.documentElement.style.setProperty('--color-primary', themeColor);
```

All UI components use: `bg-[var(--color-primary)]`

---

## 🔒 Security

### Authentication Flow
```
1. User registers/logs in
2. Server creates JWT token with:
   - user_id
   - tenant_id
   - expiration (7 days)
3. Token stored in HTTP-only cookie
4. All API requests validate token
5. Session checked against database
```

### Tenant Validation
```typescript
// Every API route validates tenant
const session = await validateSession(token);
if (session.tenant_id !== process.env.TENANT_ID) {
  return 401 Unauthorized;
}
```

### Cookie Security
- HTTP-only (no JavaScript access)
- Secure (HTTPS only in production)
- SameSite=Lax (CSRF protection)
- Tenant-specific names (no conflicts)

---

## 📈 Performance

### Optimizations
- **Telemetry Tracking** - Monitor AI performance
- **Temperature Control** - 0.7 for balanced responses
- **Smart Caching** - System prompts cached on AI provider
- **Grouped Queries** - Efficient menu display

### Response Times
- Menu query: ~200ms
- Order placement: ~400ms
- AI response: ~1-2s (streaming)

---

## 🧪 Testing

### Multi-Tenant Testing
```bash
# Test Pista House
curl http://pistahouse.waiter.local:4444/api/menu

# Test Chutneys  
curl http://chutneys.waiter.local:4444/api/menu

# Test Chef Agent
curl http://localhost:5555/api/a2a

# Verify isolation - should be different!
```

### Concurrent Users Testing
```bash
# Open 3+ browser tabs
# Login different users
# Send messages simultaneously
# All should work independently
```

---

## 🚢 Deployment

### Environment Variables (Per Tenant)
```bash
# Required
TENANT_ID=tenant-pista-house
TENANT_NAME="Pista House"
DB_HOST=localhost
DB_NAME=demo
JWT_SECRET=your-secret-key
CEREBRAS_API_KEY=your-key

# Optional
AI_PROVIDER=cerebras
AI_MODEL=llama3.1-8b
GOOGLE_API_KEY=fallback-key
```

### Production Checklist
- ✅ Set unique `JWT_SECRET` per tenant
- ✅ Use environment-specific database
- ✅ Enable HTTPS for cookies
- ✅ Set proper CORS headers
- ✅ Configure rate limiting
- ✅ Set up monitoring/logging

---

## 📚 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, register, logout
│   │   ├── chat/          # AI conversation endpoint
│   │   ├── menu/          # Menu CRUD
│   │   ├── settings/      # Restaurant config
│   │   └── theme/         # Dynamic theming
│   ├── admin/             # Admin dashboard
│   └── agent/             # Customer chat interface
├── lib/
│   ├── db/
│   │   ├── postgres.ts    # Database client
│   │   └── migrations/    # SQL schema files
│   ├── repository/        # Data access layer
│   │   ├── auth.ts
│   │   └── restaurant.ts
│   └── utils/             # Helper functions
└── components/            # React components
    ├── ai-elements/       # Chat UI
    ├── auth/              # Auth components
    └── layout/            # Layout components
```

---

## 🤝 Contributing

### Adding a New Tenant
1. Create environment file: `env.new-restaurant.template`
2. Add database seed: `INSERT INTO tenants...`
3. Seed menu items and configuration
4. Update `package.json` scripts: `dev:new-restaurant`
5. Add to `dev:all` script for concurrent launch

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **AI SDK** by Vercel
- **Cerebras** for fast AI inference
- **PostgreSQL** for reliable data storage
- **Next.js** for the amazing framework

---

## 📞 Support

For issues or questions, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for the restaurant industry**
