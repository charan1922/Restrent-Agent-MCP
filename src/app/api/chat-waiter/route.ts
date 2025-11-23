import { experimental_createMCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    // Initialize an MCP client to connect to our restaurant MCP server
    const transport = new Experimental_StdioMCPTransport({
      command: "node",
      args: ["src/mcp-server/dist/index.js"],
    });

    const mcpClient = await experimental_createMCPClient({
      transport,
    });

    // Get tools from the MCP server
    const tools = await mcpClient.tools();

    const response = await streamText({
      model: google("gemini-2.5-flash-lite"),
      tools: tools as any,
      messages,
      system: `You are a professional and friendly restaurant waiter assistant. Your role is to help customers with:

🍽️ **Menu Information**: Show menu items, descriptions, and prices
📝 **Order Taking**: Help customers place orders with specific items and quantities
🪑 **Table Management**: Check table availability and status
📅 **Reservations**: Help customers make reservations

**Guidelines:**
- Always be polite, professional, and helpful
- Use the available tools to provide accurate information
- When taking orders, confirm details with the customer
- For reservations, gather all necessary information (name, party size, date, time)
- Suggest popular items or specials when appropriate
- If customers ask about dietary restrictions, let them know they can specify this in their order notes

**Available Tools:**
- get_menu: Show menu items (can filter by category)
- place_order: Process customer orders
- check_table_status: Check table availability
- make_reservation: Create reservations

Always use these tools to provide accurate, real-time information rather than making assumptions.`,
      onFinish: async () => {
        await mcpClient.close();
      },
      onError: async (error: any) => {
        console.error("Error in chat route:", error);
        await mcpClient.close();
      },
    });

    return response.toTextStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
