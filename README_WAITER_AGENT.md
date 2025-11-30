# Waiter Agent - Restaurant Management System

An intelligent AI-powered waiter agent for managing restaurant operations including reservations, orders, menu queries, and payments. Built with Next.js, TypeScript, and Google's Gemini AI, with A2A protocol integration for communicating with a Chef Agent.

## 🎯 Features

### Core Capabilities
- **🍽️ Menu Management**: Query menu items with filtering by category, dietary preferences, and allergens
- **📅 Reservation System**: Book tables, check availability, manage reservations
- **🛒 Order Management**: Place orders, track status, modify/cancel orders
- **💳 Payment Processing**: Generate bills with GST calculation, process payments, issue receipts
- **🤝 Chef Agent Integration**: A2A protocol communication with Chef Agent on port 5000

### AI-Powered Interactions
- Natural language understanding for customer requests
- Proactive suggestions and recommendations
- Dietary restriction awareness
- Multi-turn conversation context
- Error handling and graceful degradation

## 🏗️ Architecture

```
┌─────────────────┐
│  Customer UI    │
│ (Chat Interface)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Waiter Agent   │ ◄── Gemini 2.0 Flash
│  (Port 4000)    │
└────────┬────────┘
         │
         ├─── Menu KB
         ├─── Database (In-Memory)
         │
         ▼
┌─────────────────┐
│  Chef Agent     │ ◄── A2A Protocol
│  (Port 5000)    │
└─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Google AI API key
- Chef Agent running on port 5000 (optional - will degrade gracefully)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd /path/to/rag-ai
   pnpm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   CHEF_AGENT_URL=http://localhost:5000
   CHEF_AGENT_TIMEOUT=30000
   CHEF_AGENT_RETRY_ATTEMPTS=3
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```
   The Waiter Agent will be available at `http://localhost:4000`

4. **Access the chat interface**
   Navigate to `http://localhost:4000/agent`

### Testing Chef Agent Connection

Run the connection test script:
```bash
npx tsx src/lib/a2a/test-chef-connection.ts
```

This will test:
- Health check
- Order placement
- Status requests
- Order cancellation

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Main AI chat endpoint
│   │   ├── menu/route.ts          # Menu API
│   │   ├── orders/route.ts        # Orders API (GET, POST, PATCH, DELETE)
│   │   ├── reservations/route.ts  # Reservations API
│   │   └── payments/route.ts      # Payments API
│   └── agent/
│       └── ConversationDemo.tsx   # Chat UI component
├── lib/
│   ├── a2a/
│   │   ├── chef-client.ts         # A2A client for Chef Agent
│   │   ├── schema.ts              # Zod schemas for A2A messages
│   │   └── test-chef-connection.ts # Connection test script
│   └── restaurant/
│       ├── database.ts            # In-memory database
│       └── menu-kb.ts             # Menu knowledge base
└── components/
    └── restaurant/
        ├── OrderSummary.tsx       # Order display component
        └── Receipt.tsx            # Receipt component
```

## 🔧 API Endpoints

### Menu API
- `GET /api/menu` - Query menu items
  - Query params: `search`, `category`, `vegetarian`, `vegan`, `allergens`

### Reservations API
- `GET /api/reservations` - Get reservations or check availability
- `POST /api/reservations` - Create new reservation
- `PATCH /api/reservations` - Update/cancel reservation

### Orders API
- `GET /api/orders` - Get orders by table or order ID
- `POST /api/orders` - Place new order (sends to Chef Agent)
- `PATCH /api/orders` - Modify existing order
- `DELETE /api/orders` - Cancel order (notifies Chef Agent)

### Payments API
- `GET /api/payments` - Get payment details
- `POST /api/payments` - Process payment and generate receipt

## 🤖 AI Tools Available to Waiter Agent

1. **queryMenu** - Search and retrieve menu items
2. **manageReservation** - Create, check, or cancel reservations
3. **placeOrder** - Send orders to Chef Agent
4. **requestOrderStatus** - Check order preparation status
5. **processPayment** - Handle billing and payments

## 🔗 A2A Protocol Integration

The Waiter Agent communicates with the Chef Agent using the A2A (Agent-to-Agent) protocol:

### Message Types
- `PLACE_ORDER` - Send new order to Chef
- `REQUEST_STATUS` - Query order status
- `CANCEL_ORDER` - Cancel an order

### Features
- Automatic retry with exponential backoff
- 30-second timeout per request
- Health check caching (30 seconds)
- Graceful degradation when Chef is offline

### Chef Agent Requirements
The Chef Agent must:
- Run on `http://localhost:5000` (configurable via env)
- Expose agent card at `/.well-known/agent-card.json`
- Accept A2A messages matching the schema in `src/lib/a2a/schema.ts`
- Return responses with order status, ETA, and ingredient availability

## 📊 Database Schema

### Tables
- 7 tables (T1-T7) with varying capacities (2-8 people)
- Statuses: available, seated, reserved, dirty

### Reservations
- Guest info, party size, date/time
- Table assignment
- Special requests

### Orders
- Table ID, items, total
- Status tracking (pending → sent_to_chef → preparing → ready → served → paid)
- Chef order ID for A2A tracking
- ETA from Chef

### Payments
- Order linkage
- Payment method (cash, credit, debit, UPI)
- GST calculation (18%)

## 🎨 UI Components

### ConversationDemo
Main chat interface with:
- Message streaming
- Suggestion chips
- Tool execution visualization

### OrderSummary
Displays:
- Order items with modifications
- Status badges
- ETA countdown
- Total amount

### Receipt
Professional receipt with:
- Itemized billing
- Tax breakdown
- Payment method
- Downloadable text format

## 🧪 Testing

### Manual Testing Scenarios

1. **Menu Query**
   ```
   User: "Show me vegetarian options"
   Expected: List of vegetarian items with prices in ₹
   ```

2. **Reservation**
   ```
   User: "Book a table for 4 people tonight at 7 PM"
   Expected: Availability check, table assignment, confirmation
   ```

3. **Order Placement**
   ```
   User: "I'd like 2 Chicken Tikka Masala for table T3"
   Expected: Order confirmation, Chef receives order, ETA provided
   ```

4. **Order Status**
   ```
   User: "What's the status of my order?"
   Expected: Current status from Chef, ETA update
   ```

5. **Payment**
   ```
   User: "I'd like to pay with UPI"
   Expected: Bill with GST, payment processing, receipt
   ```

## 🔍 Troubleshooting

### Chef Agent Connection Issues
- Verify Chef Agent is running: `curl http://localhost:5000/.well-known/agent-card.json`
- Check logs for connection errors
- Run test script: `npx tsx src/lib/a2a/test-chef-connection.ts`
- Waiter Agent will continue operating with degraded functionality if Chef is offline

### Menu Not Loading
- Check `src/lib/restaurant/menu-kb.ts` for menu data
- Verify API endpoint: `curl http://localhost:4000/api/menu`

### Orders Not Saving
- Database is in-memory - resets on server restart
- For production, migrate to persistent storage (Drizzle + Neon PostgreSQL)

## 🚧 Future Enhancements

- [ ] Persistent database (PostgreSQL)
- [ ] Real-time order updates via WebSockets
- [ ] Admin dashboard for kitchen/management
- [ ] Multi-language support
- [ ] Table layout visualization
- [ ] Inventory integration with Chef Agent
- [ ] Analytics and reporting
- [ ] Customer loyalty program

## 📝 License

MIT

## 🤝 Contributing

This is a demonstration project for agentic AI systems. Feel free to use it as a reference for building your own agent-based applications.

---

**Built with ❤️ using Next.js, TypeScript, Gemini AI, and A2A Protocol**
