import { streamText, tool, convertToModelMessages, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    console.log('Received messages:', messages);

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: `You are an expert AI waiter at "Indian Restaurant" - a premium Indian dining establishment. 
Your role is to provide exceptional customer service, handle all front-of-house operations, and ensure a delightful dining experience.

🎯 YOUR CORE RESPONSIBILITIES:
1. **Guest Engagement**: Greet warmly, answer questions, provide recommendations
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
1. Confirm table (number) preference before placing orders else suggest a table
2. Verify all items and quantities with the guest
3. Use placeOrder tool to send to Chef Agent (running on port 5000)
4. Inform guest of the estimated time of arrival (ETA) from Chef
5. If Chef Agent is unavailable, apologize and note order will be processed manually

📊 ORDER STATUS TRACKING:
- Use requestOrderStatus to check on orders
- Proactively update guests on preparation progress
- Statuses: PENDING → CONFIRMED → PREPARING → READY → SERVED
- If delays occur, apologize and provide updated ETA

💳 PAYMENT HANDLING:
- Generate itemized bills with subtotal, GST (18%), and total
- Accept: cash, credit, debit, UPI
- Provide detailed receipt after payment
- Thank guests and invite them back

⚠️ ERROR HANDLING:
- If Chef Agent is offline: "I've noted your order. Our kitchen will prepare it shortly."
- If item unavailable: Suggest similar alternatives
- If table full: Offer waitlist or alternative times
- Always remain calm and solution-oriented

🤝 CHEF AGENT INTEGRATION:
- Chef Agent runs on http://localhost:5000 via A2A protocol
- Send orders immediately after confirmation
- Chef provides: order confirmation, ETA, ingredient availability, cost breakdown
- If Chef is unreachable, continue service gracefully

🎨 RESPONSE FORMAT:
- Use clear, structured responses
- Format prices as: ₹150, ₹300, etc.
- Use emojis sparingly for warmth (🍛 🥘 ☕)
- Provide order summaries in bullet points
- Make receipts easy to read

Remember: You represent the restaurant's hospitality. Every interaction should leave guests feeling valued and excited about their meal!`,
      messages: convertToModelMessages(messages),
      tools: {
        queryMenu: tool({
          description: "Search and retrieve menu items with prices, ingredients, and dietary information. Use this to answer questions about the menu, prices, ingredients, or dietary options.",
          inputSchema: z.object({
            search: z.string().optional().describe("Search term for menu items"),
            category: z.enum(["appetizers", "mains", "breads", "beverages", "desserts"]).optional().describe("Filter by category"),
            vegetarian: z.boolean().optional().describe("Filter for vegetarian items"),
            vegan: z.boolean().optional().describe("Filter for vegan items"),
          }),
          execute: async ({ search, category, vegetarian, vegan }) => {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (category) params.append("category", category);
            if (vegetarian) params.append("vegetarian", "true");
            if (vegan) params.append("vegan", "true");

            const res = await fetch(`http://localhost:4000/api/menu?${params}`);
            const data = await res.json();

            return {
              items: data.items?.map((item: any) => ({
                name: item.name,
                price: `₹${item.price}`,
                description: item.description,
                category: item.category,
                isVegetarian: item.isVegetarian,
                isVegan: item.isVegan,
                allergens: item.allergens || [],
              })) || [],
            };
          },
        }),

        manageReservation: tool({
          description: "Create, check, or manage table reservations. Use this to book tables, check availability, or update existing reservations. If the table is full, offer waitlist or alternative times. If user doesn't have table preference, suggest available tables.",
          inputSchema: z.object({
            action: z.enum(["create", "check_availability", "cancel"]).describe("Action to perform"),
            guestName: z.string().optional().describe("Guest name for reservation"),
            partySize: z.number().optional().describe("Number of people"),
            dateTime: z.string().optional().describe("Date and time in ISO format"),
            reservationId: z.string().optional().describe("Reservation ID for updates/cancellations"),
            contactInfo: z.string().optional().describe("Contact information"),
            specialRequests: z.string().optional().describe("Special requests or dietary needs"),
          }),
          execute: async ({ action, guestName, partySize, dateTime, reservationId, contactInfo, specialRequests }) => {
            if (action === "check_availability") {
              const params = new URLSearchParams();
              if (partySize) params.append("partySize", partySize.toString());
              
              const res = await fetch(`http://localhost:4000/api/reservations?${params}`);
              const data = await res.json();
              
              return {
                success: data.success,
                hasAvailability: data.hasAvailability,
                availableTables: data.availableTables,
              };
            }

            if (action === "create") {
              const res = await fetch(`http://localhost:4000/api/reservations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  guestName,
                  partySize,
                  dateTime,
                  contactInfo,
                  specialRequests,
                }),
              });
              const data = await res.json();
              
              return {
                success: data.success,
                reservation: data.reservation,
                message: data.message,
                error: data.error,
              };
            }

            if (action === "cancel") {
              const res = await fetch(`http://localhost:4000/api/reservations`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reservationId,
                  status: "cancelled",
                }),
              });
              const data = await res.json();
              
              return {
                success: data.success,
                reservation: data.reservation,
              };
            }

            return { success: false, error: "Invalid action" };
          },
        }),

        placeOrder: tool({
          description: "Place a new order for a table. This sends the order to the kitchen. Always confirm items and quantities with the guest before placing the order.",
          inputSchema: z.object({
            tableId: z.string().describe("Table ID (e.g., T1, T2, T3)"),
            items: z.array(z.object({
              itemId: z.string().describe("Menu item ID"),
              quantity: z.number().describe("Quantity"),
              modifications: z.array(z.string()).optional().describe("Modifications like 'no onions', 'extra spicy'"),
              specialInstructions: z.string().optional().describe("Special cooking instructions"),
            })).describe("List of items to order"),
          }),
          execute: async ({ tableId, items }) => {
            const res = await fetch(`http://localhost:4000/api/orders`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tableId,
                items,
              }),
            });
            const data = await res.json();
            
            return {
              success: data.success,
              order: data.order,
              chefStatus: data.chefStatus,
              eta: data.eta,
              message: data.message,
              warning: data.warning,
              error: data.error,
            };
          },
        }),

        requestOrderStatus: tool({
          description: "Check the status of an order and get the estimated time of arrival (ETA) from the kitchen.",
          inputSchema: z.object({
            orderId: z.string().describe("Order ID to check status for"),
          }),
          execute: async ({ orderId }) => {
            const res = await fetch(`http://localhost:4000/api/orders?orderId=${orderId}`);
            const data = await res.json();
            
            if (!data.success) {
              return {
                success: false,
                error: data.error,
              };
            }

            return {
              success: true,
              order: {
                id: data.order.id,
                tableId: data.order.tableId,
                status: data.order.status,
                eta: data.order.eta,
                items: data.order.items,
                total: data.order.total,
              },
            };
          },
        }),

        processPayment: tool({
          description: "Process payment for an order. Generate bill and complete the payment transaction.",
          inputSchema: z.object({
            orderId: z.string().describe("Order ID to process payment for"),
            method: z.enum(["cash", "credit", "debit", "upi"]).describe("Payment method"),
          }),
          execute: async ({ orderId, method }) => {
            const res = await fetch(`http://localhost:4000/api/payments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                method,
              }),
            });
            const data = await res.json();
            
            return {
              success: data.success,
              payment: data.payment,
              receipt: data.receipt,
              message: data.message,
              error: data.error,
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
