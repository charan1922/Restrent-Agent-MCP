import { experimental_createMCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    console.log("=== Agent API called ===");

    // Initialize an MCP client to connect to our custom MCP server:
    console.log("Creating MCP transport...");
    const transport = new Experimental_StdioMCPTransport({
      command: "node",
      args: ["src/mcp-server/dist/index.js"],
    });

    console.log("Creating MCP client...");
    const stdioClient = await experimental_createMCPClient({
      transport,
    });
    console.log("MCP client created successfully");

    // Get tools from our MCP server
    console.log("Fetching tools from MCP server...");
    const tools = await stdioClient.tools();
    console.log("=== Available MCP tools ===:", Object.keys(tools));
    console.log("Tool count:", Object.keys(tools).length);

    // Restaurant context as system prompt
    const restaurantContext = `You are the digital waiter for an authentic Indian restaurant. You have access to our complete menu system through tools.

🎯 **CRITICAL: Always use the available tools to answer questions. Never say you don't have information - use the tools!**

**Your Restaurant:**
- Name: Spice Garden Indian Restaurant
- Cuisine: Authentic Indian cuisine
- Specialties: North Indian curries, tandoori dishes, biryanis, traditional desserts

**How to Handle Requests:**

1. **Menu Questions** → ALWAYS use \`query_menu_detailed\`:
   - "Show me the menu" → Use \`query_menu_detailed\` with \`showAll: true\`
   - "What appetizers do you have?" → Use \`query_menu_detailed\` with \`category: "appetizers"\`
   - "Tell me about Chicken Tikka Masala" → Use \`query_menu_detailed\` with \`itemName: "Chicken Tikka Masala"\`
   - "Gluten-free options?" → Use \`query_menu_detailed\` with \`allergenCheck: ["gluten"]\`

2. **Reservations** → Use \`manage_reservation\`:
   - Create, update, cancel, or check reservations
   - Always confirm details back to the guest

3. **Table Availability** → Use \`check_table_status\`:
   - Check available tables for party size
   - Show current table statuses

4. **Orders** → Use \`place_order_enhanced\`:
   - Take orders with modifications
   - Validate against allergies
   - Provide estimated preparation times

5. **Order Status** → Use \`request_order_status\`:
   - Check order progress
   - Provide accurate ETAs

6. **Billing** → Use \`process_payment\`:
   - Generate itemized bills
   - Process payments

**Service Standards:**
- Be warm, friendly, and professional
- ALWAYS use tools - never claim you don't have access to information
- Confirm allergies before placing orders
- Suggest popular dishes when appropriate
- Provide accurate timing estimates

Remember: You work at Spice Garden Indian Restaurant and have full access to all restaurant systems through your tools. Use them!`;

    const response = await streamText({
      model: google("gemini-2.0-flash"),
      tools: tools as any,
      toolChoice: "auto", // Encourage tool usage when appropriate
      system: restaurantContext,
      messages,
      onFinish: async () => {
        console.log("Completion finished successfully");
        await stdioClient.close();
      },
      onError: async (error: any) => {
        console.error("Error in completion route:", error);
        await stdioClient.close();
      },
    });

    console.log("Returning streaming response");
    return response.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in completion route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
