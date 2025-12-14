import { tool } from "ai";
import { z } from "zod";
import * as repo from "@/lib/repository/restaurant";
import { getChefAgentClient } from "@/lib/a2a/chef-client";
import { v4 as uuidv4 } from "uuid";

export const createTools = (tenantId: string) => ({
  queryMenu: tool({
    description: "Search and retrieve menu items. Call with NO parameters to show the FULL MENU. Use filters only when customer specifically requests them (e.g., 'vegetarian items' or 'desserts'). IMPORTANT: Always use this tool before placing orders to get item IDs.",
    inputSchema: z.object({
      search: z.string().optional().nullable().describe("Search term for menu items (e.g., 'biryani', 'dosa')"),
      category: z.string().optional().nullable().describe("Filter by category (get from menu_categories table)"),
      vegetarian: z.boolean().optional().nullable().describe("Filter for vegetarian items"),
      vegan: z.boolean().optional().nullable().describe("Filter for vegan items"),
    }),
    execute: async ({ search, category, vegetarian, vegan }) => {
      let items: any[] = [];
      
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
});

export type AppTools = ReturnType<typeof createTools>;
