import { streamText, tool, convertToModelMessages, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import * as repo from "@/lib/repository/restaurant";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    // 1. Identify Tenant
    const tenantId = process.env.TENANT_ID;
    const tenantName = process.env.TENANT_NAME || "Restaurant";
    
    if (!tenantId) {
      console.error("TENANT_ID is missing in environment variables");
      return new Response("Server Configuration Error", { status: 500 });
    }

    // 2. Fetch System Prompt for Tenant
    const customPrompt = await repo.getSystemPrompt(tenantId);
    
    const systemPrompt = customPrompt || `You are an expert AI waiter at "${tenantName}". 
Your role is to provide exceptional customer service, handle all front-of-house operations, and ensure a delightful dining experience.

🎯 YOUR CORE RESPONSIBILITIES:
1. **Guest Engagement**: Greet warmly as "${tenantName}" staff, answer questions, provide recommendations
2. **Reservations**: Manage table bookings, check availability, handle modifications
3. **Menu Knowledge**: Deep expertise in all dishes, ingredients, allergens, and pricing
4. **Order Management**: Capture orders accurately, communicate with Chef Agent, track status
5. **Payment Processing**: Generate bills, process payments, provide receipts

💬 COMMUNICATION STYLE:
- Be warm, professional, and attentive
- Use natural, conversational language
- Show enthusiasm about the cuisine
- Be proactive in offering suggestions
- Acknowledge guest preferences and dietary restrictions
- Always confirm important details before proceeding
- ALWAYS start by welcoming the guest to "${tenantName}"

🍽️ MENU & ORDERING GUIDELINES:
- Always use the queryMenu tool to provide accurate, up-to-date information
- Never suggest items that are not available in the menu
- Highlight vegetarian/vegan options when asked
- Warn about allergens (dairy, gluten, nuts) when relevant
- Suggest complementary items (e.g., naan with curry, lassi with spicy dishes)
- Explain spice levels: 0=mild, 1=medium, 2=spicy, 3=very spicy

📅 RESERVATION PROTOCOL:
- Always check availability before confirming
- Confirm: guest name, party size, date/time, contact info
- Provide table assignment when available
- Handle special requests (dietary needs, celebrations, accessibility)
- Offer alternative times if requested slot is unavailable

🔧 ORDER WORKFLOW:
1. **CRITICAL**: Always use queryMenu FIRST to get item IDs before placing any order
2. Confirm table (number) preference before placing orders else suggest a table
3. Verify all items and quantities with the guest
4. Use the 'id' field from queryMenu results as itemId in placeOrder
5. Use placeOrder tool to send to Chef Agent
6. Inform guest of the estimated time of arrival (ETA) from Chef

📊 ORDER STATUS TRACKING:
- Use requestOrderStatus to check on orders
- Proactively update guests on preparation progress
- Statuses: PENDING → CONFIRMED → PREPARING → READY → SERVED

💳 PAYMENT HANDLING:
- Generate itemized bills with subtotal, GST (18%), and total
- Accept: cash, credit, debit, UPI
- Provide detailed receipt after payment
- Thank guests and invite them back

🎨 RESPONSE FORMAT:
- Use clear, structured responses
- Format prices as: ₹150, ₹300, etc.
- Use emojis sparingly for warmth (🍛 🥘 ☕)
- Provide order summaries in bullet points
- Make receipts easy to read
`;

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      tools: {
        queryMenu: tool({
          description: "Search and retrieve menu items with prices, ingredients, and dietary information. Use this to answer questions about the menu, prices, ingredients, or dietary options. IMPORTANT: Always use this tool before placing orders to get the correct item IDs.",
          inputSchema: z.object({
            search: z.string().optional().describe("Search term for menu items"),
            category: z.enum(["appetizers", "mains", "breads", "beverages", "desserts"]).optional().describe("Filter by category"),
            vegetarian: z.boolean().optional().describe("Filter for vegetarian items"),
            vegan: z.boolean().optional().describe("Filter for vegan items"),
          }),
          execute: async ({ search, category, vegetarian, vegan }) => {
            let items = [];
            
            if (search) {
              items = await repo.searchMenuByName(tenantId, search);
            } else if (category) {
              items = await repo.getMenuByCategory(tenantId, category);
            } else if (vegetarian) {
              items = await repo.getVegetarianItems(tenantId);
            } else if (vegan) {
              items = await repo.getVeganItems(tenantId);
            } else {
              items = await repo.getAllMenuItems(tenantId);
            }

            // FILTER: Apply additional filters if needed (e.g. searching within a category)
            if (category && search) {
               items = items.filter((item: any) => item.category === category);
            }

            // Return as formatted text
            if (!items || items.length === 0) {
              return "No menu items found.";
            }

            return items.map((item: any) => 
              `${item.name} - ₹${item.price}\n${item.description}\nCategory: ${item.category}\nTags: ${item.is_vegetarian ? 'Veg' : ''} ${item.is_vegan ? 'Vegan' : ''}\nID: ${item.id}`
            ).join('\n\n');
          },
        }),

        manageReservation: tool({
          description: "Create, check, or manage table reservations. Use this to book tables, check availability, or update existing reservations.",
          inputSchema: z.object({
            action: z.enum(["create", "check_availability", "cancel"]).describe("Action to perform"),
            guestName: z.string().optional().describe("Guest name"),
            partySize: z.number().optional().describe("Number of people"),
            dateTime: z.string().optional().describe("Date and time in ISO format"),
            reservationId: z.string().optional().describe("Reservation ID"),
            contactInfo: z.string().optional().describe("Contact info"),
            specialRequests: z.string().optional().describe("Special requests"),
          }),
          execute: async ({ action, guestName, partySize, dateTime, reservationId, contactInfo, specialRequests }) => {
            if (action === "check_availability") {
              const tables = await repo.getAvailableTables(tenantId, partySize || 2);
              return {
                availableTables: tables,
                hasAvailability: tables.length > 0
              };
            }

            if (action === "create") {
              if (!guestName || !partySize || !dateTime) {
                return { success: false, error: "Missing required details" };
              }
              
              const reservation = await repo.createReservation(tenantId, {
                guestName,
                partySize,
                dateTime: new Date(dateTime),
                contactInfo,
                specialRequests
              });
              
              return { success: true, reservation };
            }

            if (action === "cancel") {
              if (!reservationId) return { success: false, error: "Missing reservation ID" };
              const reservation = await repo.updateReservation(tenantId, reservationId, { status: "cancelled" });
              
              return { success: true, status: "cancelled" }; 
            }
            
            return { success: false, error: "Invalid action" };
          },
        }),

        placeOrder: tool({
          description: "Place a new order. MUST use valid item IDs from queryMenu.",
          inputSchema: z.object({
            tableId: z.string().describe("Table ID"),
            items: z.array(z.object({
              itemId: z.string(),
              quantity: z.number(),
              modifications: z.array(z.string()).optional(),
              specialInstructions: z.string().optional(),
            })),
          }),
          execute: async ({ tableId, items }) => {
            // Validate items exist and calculate total
            let total = 0;
            const validItems = [];
            
            for (const item of items) {
              const menuItem = await repo.getMenuItemById(tenantId, item.itemId);
              if (menuItem) {
                total += menuItem.price * item.quantity;
                validItems.push({
                  ...item,
                  name: menuItem.name,
                  price: menuItem.price
                });
              }
            }
            
            if (validItems.length === 0) {
              return { success: false, error: "No valid items found in order" };
            }

            const order = await repo.createOrder(tenantId, {
              tableId,
              items: validItems,
              total,
              status: "pending",
              eta: 15 // Default ETA
            });

            // Send to Chef Agent (Mock or actual implementation)
            // Here we just return success
            
            return {
              success: true,
              order,
              message: "Order placed successfully. Sent to kitchen.",
              eta: 15
            };
          },
        }),

        requestOrderStatus: tool({
          description: "Check order status.",
          inputSchema: z.object({
            orderId: z.string(),
          }),
          execute: async ({ orderId }) => {
            const order = await repo.getOrder(tenantId, orderId);
            if (!order) return { success: false, error: "Order not found" };
            return { success: true, order };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
