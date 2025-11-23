import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Define tools that your MCP server will provide
const MENU_TOOL = {
    name: "get_menu",
    description: "Get the restaurant menu with categories and items",
    inputSchema: {
        type: "object",
        properties: {
            category: {
                type: "string",
                description: "Optional category filter (appetizers, mains, desserts, drinks)",
            },
        },
        required: [],
    },
};
const ORDER_TOOL = {
    name: "place_order",
    description: "Place an order for the customer",
    inputSchema: {
        type: "object",
        properties: {
            items: {
                type: "array",
                description: "Array of order items",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Item name" },
                        quantity: { type: "number", description: "Quantity" },
                        notes: { type: "string", description: "Special instructions" },
                    },
                    required: ["name", "quantity"],
                },
            },
            customerName: {
                type: "string",
                description: "Customer name for the order",
            },
            tableNumber: {
                type: "number",
                description: "Table number",
            },
        },
        required: ["items", "customerName"],
    },
};
const TABLE_STATUS_TOOL = {
    name: "check_table_status",
    description: "Check the status of tables in the restaurant",
    inputSchema: {
        type: "object",
        properties: {
            tableNumber: {
                type: "number",
                description: "Specific table number to check (optional)",
            },
        },
        required: [],
    },
};
const RESERVATION_TOOL = {
    name: "make_reservation",
    description: "Make a reservation for customers",
    inputSchema: {
        type: "object",
        properties: {
            customerName: {
                type: "string",
                description: "Customer name",
            },
            partySize: {
                type: "number",
                description: "Number of people",
            },
            date: {
                type: "string",
                description: "Reservation date (YYYY-MM-DD)",
            },
            time: {
                type: "string",
                description: "Reservation time (HH:MM)",
            },
            specialRequests: {
                type: "string",
                description: "Any special requests or dietary restrictions",
            },
        },
        required: ["customerName", "partySize", "date", "time"],
    },
};
class RestaurantMCPServer {
    constructor() {
        this.server = new Server({
            name: "restaurant-waiter-mcp-server",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error("[MCP Error]", error);
        };
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [MENU_TOOL, ORDER_TOOL, TABLE_STATUS_TOOL, RESERVATION_TOOL],
            };
        });
        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "get_menu":
                        return await this.handleGetMenu(args);
                    case "place_order":
                        return await this.handlePlaceOrder(args);
                    case "check_table_status":
                        return await this.handleCheckTableStatus(args);
                    case "make_reservation":
                        return await this.handleMakeReservation(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error executing tool "${name}": ${errorMessage}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async handleGetMenu(args) {
        const menu = {
            appetizers: [
                {
                    name: "Bruschetta",
                    price: "$8",
                    description: "Toasted bread with tomatoes and basil",
                },
                {
                    name: "Calamari Rings",
                    price: "$12",
                    description: "Crispy fried squid with marinara sauce",
                },
                {
                    name: "Caesar Salad",
                    price: "$9",
                    description: "Romaine lettuce with parmesan and croutons",
                },
            ],
            mains: [
                {
                    name: "Grilled Salmon",
                    price: "$24",
                    description: "Atlantic salmon with lemon herb butter",
                },
                {
                    name: "Ribeye Steak",
                    price: "$32",
                    description: "12oz ribeye with garlic mashed potatoes",
                },
                {
                    name: "Chicken Parmesan",
                    price: "$19",
                    description: "Breaded chicken with marinara and mozzarella",
                },
                {
                    name: "Vegetarian Pasta",
                    price: "$16",
                    description: "Penne with seasonal vegetables and pesto",
                },
            ],
            desserts: [
                {
                    name: "Tiramisu",
                    price: "$7",
                    description: "Classic Italian coffee-flavored dessert",
                },
                {
                    name: "Chocolate Lava Cake",
                    price: "$8",
                    description: "Warm chocolate cake with vanilla ice cream",
                },
            ],
            drinks: [
                {
                    name: "House Wine",
                    price: "$8/glass",
                    description: "Red or white wine selection",
                },
                {
                    name: "Craft Beer",
                    price: "$6",
                    description: "Local brewery selection",
                },
                {
                    name: "Fresh Juice",
                    price: "$4",
                    description: "Orange, apple, or cranberry",
                },
            ],
        };
        const { category } = args;
        let result;
        if (category && menu[category]) {
            result = menu[category];
            return {
                content: [
                    {
                        type: "text",
                        text: `Here are our ${category}:\n\n${result
                            .map((item) => `${item.name} - ${item.price}\n${item.description}`)
                            .join("\n\n")}`,
                    },
                ],
            };
        }
        else {
            const fullMenu = Object.entries(menu)
                .map(([cat, items]) => `**${cat.toUpperCase()}**\n${items
                .map((item) => `${item.name} - ${item.price}\n${item.description}`)
                .join("\n\n")}`)
                .join("\n\n");
            return {
                content: [
                    {
                        type: "text",
                        text: `Here's our complete menu:\n\n${fullMenu}`,
                    },
                ],
            };
        }
    }
    async handlePlaceOrder(args) {
        const { items, customerName, tableNumber } = args;
        const orderSummary = items
            .map((item) => `${item.quantity}x ${item.name}${item.notes ? ` (${item.notes})` : ""}`)
            .join("\n");
        // Mock order ID
        const orderId = Math.floor(Math.random() * 1000) + 1;
        return {
            content: [
                {
                    type: "text",
                    text: `Order placed successfully!\n\nOrder #${orderId}\nCustomer: ${customerName}\n${tableNumber ? `Table: ${tableNumber}\n` : ""}Items:\n${orderSummary}\n\nEstimated time: 15-20 minutes`,
                },
            ],
        };
    }
    async handleCheckTableStatus(args) {
        const { tableNumber } = args;
        const mockTables = {
            1: { status: "occupied", guests: 4, server: "Alice" },
            2: { status: "available", guests: 0, server: null },
            3: { status: "reserved", guests: 0, server: "Bob" },
            4: { status: "occupied", guests: 2, server: "Carol" },
            5: { status: "cleaning", guests: 0, server: null },
        };
        if (tableNumber && mockTables[tableNumber]) {
            const table = mockTables[tableNumber];
            return {
                content: [
                    {
                        type: "text",
                        text: `Table ${tableNumber}: ${table.status.toUpperCase()}\nGuests: ${table.guests}\nServer: ${table.server || "None assigned"}`,
                    },
                ],
            };
        }
        else {
            const allTables = Object.entries(mockTables)
                .map(([num, table]) => `Table ${num}: ${table.status} (${table.guests} guests)${table.server ? ` - Server: ${table.server}` : ""}`)
                .join("\n");
            return {
                content: [
                    {
                        type: "text",
                        text: `Restaurant Table Status:\n\n${allTables}`,
                    },
                ],
            };
        }
    }
    async handleMakeReservation(args) {
        const { customerName, partySize, date, time, specialRequests } = args;
        // Mock reservation ID
        const reservationId = Math.floor(Math.random() * 10000) + 1000;
        return {
            content: [
                {
                    type: "text",
                    text: `Reservation confirmed!\n\nReservation #${reservationId}\nName: ${customerName}\nParty size: ${partySize}\nDate: ${date}\nTime: ${time}\n${specialRequests ? `Special requests: ${specialRequests}\n` : ""}Please arrive 10 minutes early. Thank you!`,
                },
            ],
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Restaurant Waiter MCP Server running on stdio");
    }
}
// Start the server
const server = new RestaurantMCPServer();
server.run().catch(console.error);
