import { streamText, tool, convertToModelMessages, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { cerebras } from "@ai-sdk/cerebras";
import { z } from "zod";
import * as repo from "@/lib/repository/restaurant";
import { NextRequest } from "next/server";
import { getTenantId, getTenantName } from "@/lib/utils/tenant";
import { getChefAgentClient } from "@/lib/a2a/chef-client";
import { v4 as uuidv4 } from "uuid";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// Configurable AI provider and model
const getModel = () => {
  const provider = process.env.AI_PROVIDER || "cerebras"; // cerebras or google
  const modelName = process.env.AI_MODEL;
  
  if (provider === "cerebras") {
    return cerebras(modelName || "llama3.1-8b");
  } else {
    return google(modelName || "gemini-2.0-flash-lite");
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages }: { messages: UIMessage[] } = body;
    
    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages:", messages);
      return new Response(JSON.stringify({ error: "Messages are required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // 1. Identify Tenant (using centralized utility)
    const tenantId = getTenantId(request);
    const tenantName = getTenantName(request);
    
    if (!tenantId) {
      console.error("TENANT_ID is missing in environment variables");
      return new Response("Server Configuration Error", { status: 500 });
    }

    // 2. Fetch Restaurant Configuration
    const customPrompt = await repo.getSetting(tenantId, 'system_prompt');
    
    let systemPrompt: string;
    
    if (customPrompt) {
      // Use custom prompt if set via Settings page
      systemPrompt = customPrompt;
    } else {
      // Build dynamic prompt from configuration
      const description = await repo.getSetting(tenantId, 'restaurant_description') || `A premium restaurant`;
      const cuisineType = await repo.getSetting(tenantId, 'cuisine_type') || 'International';
      const operatingHours = await repo.getSetting(tenantId, 'operating_hours') || '9:00 AM - 10:00 PM';
      const tone = await repo.getSetting(tenantId, 'ai_tone') || 'warm and professional';
      const specialInstructions = await repo.getSetting(tenantId, 'special_instructions') || '';
      const features = await repo.getSetting(tenantId, 'restaurant_features') || 'Dine-in, Takeaway';
      
      systemPrompt = `You are an expert AI waiter at "${tenantName}".

🏪 ABOUT ${tenantName.toUpperCase()}:
${description}
- Cuisine: ${cuisineType}
- Hours: ${operatingHours}
- Services: ${features}

🎯 YOUR CORE RESPONSIBILITIES:
1. **Guest Engagement**: Greet warmly, answer questions, provide recommendations
2. **Reservations**: Manage table bookings, check availability
3. **Menu Knowledge**: Deep expertise in dishes/pricing  
4. **Order Management**: Capture orders using tools, track status

💬 COMMUNICATION STYLE:
- Be ${tone}
- Show genuine enthusiasm
- Be specific and helpful

⛔ STRICT RULES:
- **DO NOT simulated orders**: You cannot place orders by just saying "I'll place that". You MUST use the \`placeOrder\` tool.
- **NO Fake Payments**: Do not ask for payment or generate bills. We are testing ordering ONLY.
- **Verify**: After using \`placeOrder\`, confirm the status based on the tool output, not your imagination.

🍽️ MENU & ORDERING GUIDELINES:
- Use \`queryMenu\` to look up items
- Provide accurate prices from the tool
- Always show the menu in the table format with the following columns: Item Name, Price, Description segregated by category

🔧 ORDER WORKFLOW:
1. Search menu for items (get IDs)
2. Confirm details with guest
3. **EXECUTE \`placeOrder\` TOOL**
4. Report the status returned by the tool (e.g., "Kitchen received order #123")
5. **Do NOT ask for payment**

📊 STATUS CHECKS:
- Use \`requestOrderStatus\` with the real Order ID.
- Do not guess the status.

🎨 RESPONSE FORMAT:
- Keep it brief
- No technical jargon
- Show the menu and order in the table format.
`;
    }

    const result = streamText({
      model: getModel(),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'chat-stream',
      },
      // @ts-expect-error - maxSteps is supported in runtime but may not be in type definitions
      maxSteps: 5, // Allow multi-turn tool interactions
      toolChoice: 'auto', // Force tools if appropriate? Auto is fine if prompt is strong.
      temperature: 0.2, // Lower temperature to reduce hallucinations/roleplaying
      tools: {
        queryMenu: tool({
          description: "Search and retrieve menu items. Call with NO parameters to show the FULL MENU. Use filters only when customer specifically requests them (e.g., 'vegetarian items' or 'desserts'). IMPORTANT: Always use this tool before placing orders to get item IDs.",
          inputSchema: z.object({
            search: z.string().optional().nullable().describe("Search term for menu items (e.g., 'biryani', 'dosa')"),
            category: z.string().optional().nullable().describe("Filter by category (get from menu_categories table)"),
            vegetarian: z.boolean().optional().nullable().describe("Filter for vegetarian items"),
            vegan: z.boolean().optional().nullable().describe("Filter for vegan items"),
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
              // NO FILTERS - Return ALL menu items (for "show me the menu")
              items = await repo.getAllMenuItems(tenantId);
            }

            // FILTER: Apply additional filters if needed
            if (category && search) {
               items = items.filter((item: any) => item.category === category);
            }

            // Return as formatted text with prices
            if (!items || items.length === 0) {
              return "No menu items found matching your criteria.";
            }

            // Group by category for better presentation
            const groupedByCategory: Record<string, any[]> = {};
            items.forEach((item: any) => {
              const cat = item.category || 'Other';
              if (!groupedByCategory[cat]) {
                groupedByCategory[cat] = [];
              }
              groupedByCategory[cat].push(item);
            });

            let formattedMenu = "";
            Object.keys(groupedByCategory).forEach(category => {
              formattedMenu += `\n**${category}:**\n`;
              groupedByCategory[category].forEach((item: any) => {
                const veg = item.is_vegetarian ? '🥬' : '🍖';
                const price = `₹${item.price}`;
                formattedMenu += `${veg} **${item.name}** - ${price}\n`;
                formattedMenu += `   ${item.description}\n`;
                formattedMenu += `   ID: ${item.id}\n\n`;
              });
            });

            return formattedMenu;
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
          description: "Place an order with the kitchen. Requires valid item IDs.",
          inputSchema: z.object({
            tableId: z.string().describe("The Table ID (e.g., T1)"),
            items: z.array(z.object({
              itemId: z.string(),
              itemName: z.string(),
              quantity: z.number(),
              modifications: z.array(z.string()).optional().nullable(),
              specialInstructions: z.string().optional().nullable(),
            })),
          }),
          execute: async ({ tableId, items }) => {
            try {
              let total = 0;
              const validItems = [];
              let resolvedTableId = tableId;

              // Validate/Resolve Table ID
              const allTables = await repo.getAllTables(tenantId);
              const exists = allTables.some(t => t.id === tableId);
              if (!exists) {
                // Try fuzzy resolution (e.g., "T1" -> "chutneys-table-1")
                const numberMatch = tableId.match(/(\d+)/);
                if (numberMatch) {
                  const num = numberMatch[1];
                  const match = allTables.find(t => t.id.endsWith(`-${num}`) || t.id.endsWith(`table-${num}`));
                  if (match) {
                    console.log(`[placeOrder] Resolved table ID '${tableId}' to '${match.id}'`);
                    resolvedTableId = match.id;
                  } else if (allTables.length > 0) {
                     // Fallback: Assign first available table if specific one not found (to unblock demo)
                     resolvedTableId = allTables[0].id;
                     console.log(`[placeOrder] Fallback: Assigned table '${resolvedTableId}' for '${tableId}'`);
                  }
                } else if (allTables.length > 0) {
                   resolvedTableId = allTables[0].id; // Fallback
                   console.log(`[placeOrder] Fallback: Assigned table '${resolvedTableId}' for '${tableId}'`);
                }
              }
              
              for (const item of items) {
                let menuItem = await repo.getMenuItemById(tenantId, item.itemId);
                
                // Fallback: Use itemName to find the item if ID lookup fails
                if (!menuItem && item.itemName) {
                  const searchResults = await repo.searchMenuByName(tenantId, item.itemName);
                  if (searchResults.length > 0) {
                    // Use the first match (most likely relevant)
                    menuItem = searchResults[0];
                    console.log(`[placeOrder] Fixed invalid ID '${item.itemId}' by finding '${menuItem.name}' (${menuItem.id})`);
                  }
                }

                if (menuItem) {
                  total += parseFloat(menuItem.price.toString()) * item.quantity;
                  validItems.push({
                    itemId: menuItem.id, // Use authentic ID
                    itemName: menuItem.name,
                    quantity: item.quantity,
                    modifications: item.modifications || [],
                    specialInstructions: item.specialInstructions || undefined,
                  });
                } else {
                  console.warn(`[placeOrder] Item not found: ID='${item.itemId}', Name='${item.itemName}'`);
                }
              }
              
              if (validItems.length === 0) {
                // Return specific error to help AI recover
                return { success: false, error: "No valid items found. Please check menu item IDs using queryMenu tool." };
              }

              const orderId = uuidv4();
              const chefClient = getChefAgentClient();
              console.log(`[DEBUG placeOrder] tenantId: ${tenantId}, orderId: ${orderId}`);
              const chefResponse = await chefClient.placeOrder({
                orderId,
                tableId: resolvedTableId,
                items: validItems,
                timestamp: new Date().toISOString(),
                priority: "normal",
              }, tenantId);

              if (!chefResponse || chefResponse.status === "CANCELLED") {
                // Chef rejected (e.g., missing ingredients)
                return {
                  success: false,
                  error: chefResponse.message || "Chef cannot fulfill order",
                  missingIngredients: chefResponse.missingIngredients,
                };
              }

              // Save order to Waiter's database
              const order = await repo.createOrder(tenantId, {
                tableId: resolvedTableId,
                items: validItems.map(item => ({
                  ...item,
                  name: item.itemName,
                  price: 0, // We'll just use itemId for now
                })),
                total,
                status: "sent_to_chef",
                eta: chefResponse.eta,
              });

              // Update order with chef_order_id for tracking
              await repo.updateOrder(tenantId, order.id, {
                chef_order_id: orderId,
                status: chefResponse.status.toLowerCase(),
              });

              return {
                success: true,
                orderId: order.id,
                chefOrderId: orderId,
                status: chefResponse.status,
                eta: chefResponse.eta,
                message: `Order confirmed! ${chefResponse.message}`,
                tableId: resolvedTableId,
                items: validItems,
                total,
              };
            } catch (error) {
              console.error("[placeOrder] Error:", error);
              return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to place order with Chef",
              };
            }
          },
        }),

        requestOrderStatus: tool({
          description: "Check the status of an order. Returns current status and ETA.",
          inputSchema: z.object({
            orderId: z.string().describe("The unique Order UUID"),
          }),
          execute: async ({ orderId }) => {
            try {
              const chefClient = getChefAgentClient();
              const statusResponse = await chefClient.requestOrderStatus(orderId, tenantId);

              return {
                success: true,
                orderId: statusResponse.orderId,
                status: statusResponse.status,
                eta: statusResponse.eta,
                message: statusResponse.message,
              };
            } catch (error) {
              console.error("[requestOrderStatus] Error:", error);
              return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to get order status",
              };
            }
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
