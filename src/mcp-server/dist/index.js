import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Enhanced menu knowledge base
const menuKB = {
    items: [
        // Appetizers
        {
            id: "appetizer_001",
            name: "Bruschetta",
            category: "appetizers",
            price: 12,
            description: "Toasted artisan bread topped with fresh tomatoes, basil, and garlic",
            ingredients: [
                "bread",
                "tomatoes",
                "basil",
                "garlic",
                "olive oil",
                "balsamic vinegar",
            ],
            allergens: ["gluten"],
            preparationTime: 10,
            available: true,
            modifications: ["no garlic", "extra basil", "gluten-free bread"],
        },
        {
            id: "appetizer_002",
            name: "Calamari Rings",
            category: "appetizers",
            price: 14,
            description: "Crispy fried squid rings served with marinara sauce",
            ingredients: ["squid", "flour", "eggs", "breadcrumbs", "marinara sauce"],
            allergens: ["gluten", "eggs"],
            preparationTime: 12,
            available: true,
            modifications: ["spicy marinara", "no breading"],
        },
        {
            id: "appetizer_003",
            name: "Caesar Salad",
            category: "appetizers",
            price: 11,
            description: "Crisp romaine lettuce with parmesan cheese, croutons, and Caesar dressing",
            ingredients: [
                "romaine lettuce",
                "parmesan cheese",
                "croutons",
                "caesar dressing",
                "anchovies",
            ],
            allergens: ["gluten", "dairy", "eggs"],
            preparationTime: 8,
            available: true,
            modifications: [
                "no anchovies",
                "extra parmesan",
                "grilled chicken add-on",
            ],
        },
        // Main Courses
        {
            id: "main_001",
            name: "Grilled Salmon",
            category: "mains",
            price: 28,
            description: "Fresh Atlantic salmon grilled to perfection with lemon herb butter",
            ingredients: [
                "salmon",
                "lemon",
                "herbs",
                "butter",
                "seasonal vegetables",
            ],
            allergens: ["dairy"],
            preparationTime: 18,
            available: true,
            modifications: ["no butter", "extra lemon", "side substitution"],
        },
        {
            id: "main_002",
            name: "Ribeye Steak",
            category: "mains",
            price: 35,
            description: "12oz prime ribeye steak cooked to your preference",
            ingredients: [
                "ribeye steak",
                "garlic",
                "rosemary",
                "mashed potatoes",
                "asparagus",
            ],
            allergens: ["dairy"],
            preparationTime: 22,
            available: true,
            modifications: [
                "rare",
                "medium-rare",
                "medium",
                "well-done",
                "side substitution",
            ],
        },
        {
            id: "main_003",
            name: "Chicken Parmigiana",
            category: "mains",
            price: 24,
            description: "Breaded chicken breast topped with marinara and mozzarella cheese",
            ingredients: [
                "chicken breast",
                "breadcrumbs",
                "marinara sauce",
                "mozzarella",
                "pasta",
            ],
            allergens: ["gluten", "dairy", "eggs"],
            preparationTime: 20,
            available: true,
            modifications: ["no cheese", "gluten-free breading", "side substitution"],
        },
        {
            id: "main_004",
            name: "Vegetarian Pasta",
            category: "mains",
            price: 19,
            description: "Fresh pasta with seasonal vegetables in a light olive oil sauce",
            ingredients: [
                "pasta",
                "zucchini",
                "bell peppers",
                "mushrooms",
                "olive oil",
                "parmesan",
            ],
            allergens: ["gluten", "dairy"],
            preparationTime: 15,
            available: true,
            modifications: ["vegan cheese", "gluten-free pasta", "extra vegetables"],
        },
        // Desserts
        {
            id: "dessert_001",
            name: "Tiramisu",
            category: "desserts",
            price: 9,
            description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
            ingredients: [
                "ladyfingers",
                "coffee",
                "mascarpone",
                "eggs",
                "cocoa powder",
            ],
            allergens: ["gluten", "dairy", "eggs"],
            preparationTime: 5,
            available: true,
            modifications: ["decaf coffee", "extra cocoa"],
        },
        {
            id: "dessert_002",
            name: "Chocolate Lava Cake",
            category: "desserts",
            price: 10,
            description: "Warm chocolate cake with molten center, served with vanilla ice cream",
            ingredients: [
                "chocolate",
                "flour",
                "eggs",
                "butter",
                "vanilla ice cream",
            ],
            allergens: ["gluten", "dairy", "eggs"],
            preparationTime: 12,
            available: true,
            modifications: ["no ice cream", "extra sauce"],
        },
        // Drinks
        {
            id: "drink_001",
            name: "House Red Wine",
            category: "drinks",
            price: 8,
            description: "Our signature red wine blend",
            ingredients: ["red wine"],
            allergens: [],
            preparationTime: 2,
            available: true,
            modifications: [],
        },
        {
            id: "drink_002",
            name: "Craft Beer",
            category: "drinks",
            price: 6,
            description: "Local craft beer selection",
            ingredients: ["beer"],
            allergens: ["gluten"],
            preparationTime: 2,
            available: true,
            modifications: [],
        },
        {
            id: "drink_003",
            name: "Fresh Orange Juice",
            category: "drinks",
            price: 4,
            description: "Freshly squeezed orange juice",
            ingredients: ["orange juice"],
            allergens: [],
            preparationTime: 3,
            available: true,
            modifications: ["no pulp", "extra pulp"],
        },
    ],
    categories: ["appetizers", "mains", "desserts", "drinks"],
    allergens: ["gluten", "dairy", "nuts", "shellfish", "eggs", "soy"],
};
// Mock databases - in production, these would connect to your actual database
const mockReservations = [
    {
        id: 1,
        guestName: "John Smith",
        partySize: 4,
        dateTime: "2025-11-22T19:00:00Z",
        tableNumber: 3,
        status: "confirmed",
    },
    {
        id: 2,
        guestName: "Sarah Johnson",
        partySize: 2,
        dateTime: "2025-11-22T20:30:00Z",
        tableNumber: 7,
        status: "confirmed",
    },
];
const mockTables = [
    { id: 1, tableNumber: 1, capacity: 2, status: "available", currentGuests: 0 },
    { id: 2, tableNumber: 2, capacity: 4, status: "available", currentGuests: 0 },
    { id: 3, tableNumber: 3, capacity: 4, status: "reserved", currentGuests: 0 },
    { id: 4, tableNumber: 4, capacity: 6, status: "available", currentGuests: 0 },
    { id: 5, tableNumber: 5, capacity: 2, status: "occupied", currentGuests: 2 },
    { id: 6, tableNumber: 6, capacity: 4, status: "dirty", currentGuests: 0 },
    { id: 7, tableNumber: 7, capacity: 2, status: "reserved", currentGuests: 0 },
    { id: 8, tableNumber: 8, capacity: 8, status: "available", currentGuests: 0 },
];
const mockOrders = [
    {
        id: 123,
        tableNumber: 5,
        customerName: "Mike Wilson",
        status: "preparing",
        estimatedTime: 15,
    },
    {
        id: 124,
        tableNumber: 3,
        customerName: "John Smith",
        status: "ready",
        estimatedTime: 0,
    },
];
// Helper functions
function queryMenu(itemName, category) {
    if (itemName) {
        return menuKB.items.filter((item) => item.name.toLowerCase().includes(itemName.toLowerCase()));
    }
    if (category) {
        return menuKB.items.filter((item) => item.category === category);
    }
    return menuKB.items;
}
function getMenuByCategory() {
    const grouped = {};
    menuKB.categories.forEach((category) => {
        grouped[category] = menuKB.items.filter((item) => item.category === category);
    });
    return grouped;
}
function checkAllergens(allergenList) {
    return menuKB.items.filter((item) => !item.allergens.some((allergen) => allergenList.includes(allergen)));
}
function getMenuItem(itemId) {
    return menuKB.items.find((item) => item.id === itemId);
}
// Enhanced tool definitions
const QUERY_MENU_DETAILED = {
    name: "query_menu_detailed",
    description: "Get detailed menu information including ingredients, allergens, preparation time, and modifications",
    inputSchema: {
        type: "object",
        properties: {
            itemName: {
                type: "string",
                description: "Specific item name to search for",
            },
            category: {
                type: "string",
                description: "Menu category filter (appetizers, mains, desserts, drinks)",
            },
            allergenCheck: {
                type: "array",
                items: { type: "string" },
                description: "Check for items without specific allergens",
            },
            showAll: {
                type: "boolean",
                description: "Show complete menu with all details",
            },
        },
    },
};
const MANAGE_RESERVATION_TOOL = {
    name: "manage_reservation",
    description: "Create, update, cancel, or check reservations with full guest management",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["create", "update", "cancel", "check", "list"],
                description: "Action to perform on reservation",
            },
            dateTime: {
                type: "string",
                description: "Reservation date and time (ISO format)",
            },
            partySize: {
                type: "number",
                description: "Number of guests",
            },
            guestName: {
                type: "string",
                description: "Primary guest name",
            },
            contactInfo: {
                type: "string",
                description: "Phone number or email for confirmation",
            },
            specialRequests: {
                type: "string",
                description: "Dietary restrictions, celebrations, accessibility needs",
            },
            reservationId: {
                type: "number",
                description: "Existing reservation ID for updates/cancellations",
            },
        },
        required: ["action"],
    },
};
const PLACE_ORDER_ENHANCED = {
    name: "place_order_enhanced",
    description: "Place detailed orders with modifications, validations, and allergy alerts",
    inputSchema: {
        type: "object",
        properties: {
            tableId: {
                type: "number",
                description: "Table number for the order",
            },
            customerName: {
                type: "string",
                description: "Customer name for the order",
            },
            items: {
                type: "array",
                description: "Detailed order items with specifications",
                items: {
                    type: "object",
                    properties: {
                        itemId: { type: "string", description: "Menu item ID" },
                        itemName: { type: "string", description: "Menu item name" },
                        quantity: { type: "number", description: "Quantity ordered" },
                        modifications: {
                            type: "array",
                            items: { type: "string" },
                            description: "Modifications like 'no onions', 'extra cheese', cooking preference",
                        },
                        notes: { type: "string", description: "Special preparation notes" },
                    },
                    required: ["itemName", "quantity"],
                },
            },
            specialInstructions: {
                type: "string",
                description: "Overall order instructions and timing requests",
            },
            allergyAlerts: {
                type: "array",
                items: { type: "string" },
                description: "Guest allergy information for kitchen safety",
            },
        },
        required: ["tableId", "customerName", "items"],
    },
};
const REQUEST_ORDER_STATUS = {
    name: "request_order_status",
    description: "Check current status and ETA of orders for guest inquiries",
    inputSchema: {
        type: "object",
        properties: {
            orderId: {
                type: "number",
                description: "Order ID to check status",
            },
            tableNumber: {
                type: "number",
                description: "Alternative: check by table number",
            },
        },
    },
};
const PROCESS_PAYMENT = {
    name: "process_payment",
    description: "Generate itemized bills and process various payment methods",
    inputSchema: {
        type: "object",
        properties: {
            orderId: {
                type: "number",
                description: "Order ID for billing",
            },
            tableNumber: {
                type: "number",
                description: "Alternative: bill by table number",
            },
            paymentMethod: {
                type: "string",
                enum: [
                    "cash",
                    "credit_card",
                    "debit_card",
                    "digital_wallet",
                    "gift_card",
                ],
                description: "Payment method selected by guest",
            },
            discountCode: {
                type: "string",
                description: "Optional promotional or discount code",
            },
            tipAmount: {
                type: "number",
                description: "Tip amount in dollars",
            },
            splitBill: {
                type: "boolean",
                description: "Whether to split bill among party members",
            },
        },
        required: ["paymentMethod"],
    },
};
const CHECK_TABLE_STATUS = {
    name: "check_table_status",
    description: "Check real-time table availability and seating arrangements",
    inputSchema: {
        type: "object",
        properties: {
            tableNumber: {
                type: "number",
                description: "Specific table number to check",
            },
            partySize: {
                type: "number",
                description: "Number of guests needing seating",
            },
            showAll: {
                type: "boolean",
                description: "Show status of all tables",
            },
        },
    },
};
class RestaurantMCPServer {
    constructor() {
        this.server = new Server({
            name: "restaurant-waiter-server",
            version: "2.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    QUERY_MENU_DETAILED,
                    MANAGE_RESERVATION_TOOL,
                    PLACE_ORDER_ENHANCED,
                    REQUEST_ORDER_STATUS,
                    PROCESS_PAYMENT,
                    CHECK_TABLE_STATUS,
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "query_menu_detailed":
                        return await this.handleQueryMenuDetailed(args);
                    case "manage_reservation":
                        return await this.handleManageReservation(args);
                    case "place_order_enhanced":
                        return await this.handlePlaceOrderEnhanced(args);
                    case "request_order_status":
                        return await this.handleRequestOrderStatus(args);
                    case "process_payment":
                        return await this.handleProcessPayment(args);
                    case "check_table_status":
                        return await this.handleCheckTableStatus(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }
    async handleQueryMenuDetailed(args) {
        const { itemName, category, allergenCheck, showAll } = args;
        if (allergenCheck && allergenCheck.length > 0) {
            const safeItems = checkAllergens(allergenCheck);
            return {
                content: [
                    {
                        type: "text",
                        text: `🍽️ ALLERGY-SAFE MENU OPTIONS (No ${allergenCheck.join(", ")})\n\n${safeItems
                            .map((item) => `${item.name} - $${item.price}\n${item.description}\n⏱️ Prep Time: ${item.preparationTime} min\n🥄 Ingredients: ${item.ingredients.join(", ")}\n${item.modifications?.length
                            ? `✏️ Available modifications: ${item.modifications.join(", ")}\n`
                            : ""}`)
                            .join("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")}`,
                    },
                ],
            };
        }
        if (showAll) {
            const menuByCategory = getMenuByCategory();
            let fullMenu = "🍽️ COMPLETE RESTAURANT MENU\n\n";
            Object.entries(menuByCategory).forEach(([cat, items]) => {
                fullMenu += `📂 ${cat.toUpperCase()}\n`;
                items.forEach((item) => {
                    fullMenu += `\n🍴 ${item.name} - $${item.price}\n`;
                    fullMenu += `   ${item.description}\n`;
                    fullMenu += `   ⏱️ ${item.preparationTime} min | 🧄 Ingredients: ${item.ingredients.join(", ")}\n`;
                    if (item.allergens.length > 0) {
                        fullMenu += `   ⚠️ Contains: ${item.allergens.join(", ")}\n`;
                    }
                    if (item.modifications?.length) {
                        fullMenu += `   ✏️ Modifications: ${item.modifications.join(", ")}\n`;
                    }
                });
                fullMenu += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            });
            return {
                content: [{ type: "text", text: fullMenu }],
            };
        }
        let items = [];
        if (itemName) {
            items = queryMenu(itemName);
        }
        else if (category) {
            items = queryMenu(undefined, category);
        }
        else {
            items = menuKB.items;
        }
        if (items.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Sorry, I couldn't find any menu items matching "${itemName || category}". Would you like to see our full menu or search for something else?`,
                    },
                ],
            };
        }
        const response = items
            .map((item) => `🍴 ${item.name} - $${item.price}\n${item.description}\n⏱️ Prep Time: ${item.preparationTime} minutes\n🥄 Ingredients: ${item.ingredients.join(", ")}\n${item.allergens.length
            ? `⚠️ Contains: ${item.allergens.join(", ")}\n`
            : ""}${item.modifications?.length
            ? `✏️ Available modifications: ${item.modifications.join(", ")}\n`
            : ""}`)
            .join("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        return {
            content: [{ type: "text", text: response }],
        };
    }
    async handleManageReservation(args) {
        const { action, dateTime, partySize, guestName, contactInfo, specialRequests, reservationId, } = args;
        switch (action) {
            case "create":
                const newReservationId = Math.floor(Math.random() * 10000) + 1000;
                const assignedTable = mockTables.find((t) => t.capacity >= partySize && t.status === "available");
                if (!assignedTable) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ I apologize, but we don't have a table available for ${partySize} guests at ${new Date(dateTime).toLocaleString()}. Would you like to check alternative times, or shall I add you to our waitlist?`,
                            },
                        ],
                    };
                }
                assignedTable.status = "reserved";
                mockReservations.push({
                    id: newReservationId,
                    guestName,
                    partySize,
                    dateTime,
                    tableNumber: assignedTable.tableNumber,
                    status: "confirmed",
                    specialRequests,
                    contactInfo,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ Reservation confirmed!\n\n📋 Reservation Details:\nID: #${newReservationId}\n👤 Guest: ${guestName}\n👥 Party Size: ${partySize}\n🍽️ Table: ${assignedTable.tableNumber}\n📅 Date/Time: ${new Date(dateTime).toLocaleString()}\n${contactInfo ? `📞 Contact: ${contactInfo}\n` : ""}${specialRequests
                                ? `📝 Special Requests: ${specialRequests}\n`
                                : ""}\nWe look forward to serving you!`,
                        },
                    ],
                };
            case "check":
                if (reservationId) {
                    const reservation = mockReservations.find((r) => r.id === reservationId);
                    if (reservation) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `✅ Reservation Found!\n\n📋 Details:\nID: #${reservation.id}\n👤 ${reservation.guestName}\n👥 Party of ${reservation.partySize}\n🍽️ Table ${reservation.tableNumber}\n📅 ${new Date(reservation.dateTime).toLocaleString()}\n📊 Status: ${reservation.status}\n${reservation.specialRequests
                                        ? `📝 Special Requests: ${reservation.specialRequests}`
                                        : ""}`,
                                },
                            ],
                        };
                    }
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ I couldn't find that reservation. Could you please provide the reservation ID, guest name, or phone number?",
                        },
                    ],
                };
            case "list":
                const upcomingReservations = mockReservations.filter((r) => new Date(r.dateTime) >= new Date() && r.status === "confirmed");
                if (upcomingReservations.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "📅 No upcoming reservations found for today.",
                            },
                        ],
                    };
                }
                const reservationList = upcomingReservations
                    .map((r) => `🍽️ Table ${r.tableNumber} | ${new Date(r.dateTime).toLocaleTimeString()} | ${r.guestName} (Party of ${r.partySize})`)
                    .join("\n");
                return {
                    content: [
                        {
                            type: "text",
                            text: `📅 Upcoming Reservations:\n\n${reservationList}`,
                        },
                    ],
                };
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Unknown reservation action: ${action}`,
                        },
                    ],
                };
        }
    }
    async handlePlaceOrderEnhanced(args) {
        const { tableId, customerName, items, specialInstructions, allergyAlerts } = args;
        const table = mockTables.find((t) => t.tableNumber === tableId);
        if (!table) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Table ${tableId} not found. Please verify the table number.`,
                    },
                ],
            };
        }
        let totalAmount = 0;
        let totalPrepTime = 0;
        const processedItems = [];
        for (const orderItem of items) {
            let menuItem;
            if (orderItem.itemId) {
                menuItem = getMenuItem(orderItem.itemId);
            }
            else {
                const searchResults = queryMenu(orderItem.itemName);
                menuItem = searchResults[0];
            }
            if (!menuItem) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Sorry, "${orderItem.itemName || orderItem.itemId}" is not available on our menu. Would you like to see alternative options?`,
                        },
                    ],
                };
            }
            if (!menuItem.available) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Sorry, ${menuItem.name} is currently unavailable. May I suggest an alternative from the same category?`,
                        },
                    ],
                };
            }
            if (allergyAlerts && allergyAlerts.length > 0) {
                const allergenConflict = menuItem.allergens.some((allergen) => allergyAlerts.some((alert) => alert.toLowerCase().includes(allergen.toLowerCase())));
                if (allergenConflict) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `⚠️ ALLERGY ALERT: ${menuItem.name} contains ${menuItem.allergens.join(", ")}, which may conflict with the noted allergies: ${allergyAlerts.join(", ")}. Please confirm this is safe or select an alternative.`,
                            },
                        ],
                    };
                }
            }
            processedItems.push({
                ...menuItem,
                quantity: orderItem.quantity,
                modifications: orderItem.modifications || [],
                notes: orderItem.notes || "",
            });
            totalAmount += menuItem.price * orderItem.quantity;
            totalPrepTime = Math.max(totalPrepTime, menuItem.preparationTime);
        }
        const newOrderId = Math.floor(Math.random() * 10000) + 2000;
        const newOrder = {
            id: newOrderId,
            tableNumber: tableId,
            customerName,
            items: processedItems,
            status: "confirmed",
            totalAmount,
            specialInstructions,
            allergyAlerts,
            estimatedTime: totalPrepTime + 5,
            createdAt: new Date(),
        };
        mockOrders.push(newOrder);
        table.status = "occupied";
        const itemsList = processedItems
            .map((item) => `${item.quantity}x ${item.name}${item.modifications.length
            ? ` (${item.modifications.join(", ")})`
            : ""}${item.notes ? ` - ${item.notes}` : ""}`)
            .join("\n  ");
        return {
            content: [
                {
                    type: "text",
                    text: `✅ Order confirmed and sent to kitchen!\n\n📋 ORDER #${newOrderId}\n🍽️ Table: ${tableId}\n👤 Guest: ${customerName}\n\n📝 Items:\n  ${itemsList}\n\n💰 Total: $${totalAmount.toFixed(2)}\n⏱️ Estimated time: ${newOrder.estimatedTime} minutes\n${specialInstructions
                        ? `📄 Special instructions: ${specialInstructions}\n`
                        : ""}${allergyAlerts?.length
                        ? `⚠️ Allergy alerts: ${allergyAlerts.join(", ")}\n`
                        : ""}\nI'll keep you updated on the preparation status!`,
                },
            ],
        };
    }
    async handleRequestOrderStatus(args) {
        const { orderId, tableNumber } = args;
        let order;
        if (orderId) {
            order = mockOrders.find((o) => o.id === orderId);
        }
        else if (tableNumber) {
            order = mockOrders.find((o) => o.tableNumber === tableNumber);
        }
        if (!order) {
            return {
                content: [
                    {
                        type: "text",
                        text: "❌ I couldn't find an order with those details. Could you provide the order number or table number?",
                    },
                ],
            };
        }
        const statusMessages = {
            placed: "📝 Order received and being reviewed",
            confirmed: "✅ Order confirmed and sent to kitchen",
            preparing: "👨‍🍳 Currently being prepared by our chef",
            ready: "🔔 Order ready for pickup!",
            served: "✅ Order served to table",
        };
        const statusEmoji = {
            placed: "🟡",
            confirmed: "🟦",
            preparing: "🟠",
            ready: "🟢",
            served: "✅",
        };
        return {
            content: [
                {
                    type: "text",
                    text: `${statusEmoji[order.status]} ORDER STATUS #${order.id}\n\n🍽️ Table: ${order.tableNumber}\n📊 Status: ${statusMessages[order.status]}\n⏱️ ${order.estimatedTime > 0
                        ? `Estimated time remaining: ${order.estimatedTime} minutes`
                        : "Ready to serve!"}\n\n${order.status === "ready"
                        ? "I'll bring this right out to you!"
                        : order.status === "served"
                            ? "Enjoy your meal!"
                            : "Thank you for your patience!"}`,
                },
            ],
        };
    }
    async handleProcessPayment(args) {
        const { orderId, tableNumber, paymentMethod, discountCode, tipAmount, splitBill, } = args;
        let order;
        if (orderId) {
            order = mockOrders.find((o) => o.id === orderId);
        }
        else if (tableNumber) {
            order = mockOrders.find((o) => o.tableNumber === tableNumber);
        }
        if (!order) {
            return {
                content: [
                    {
                        type: "text",
                        text: "❌ I couldn't find an order to process payment for. Could you provide the order number or table number?",
                    },
                ],
            };
        }
        let subtotal = order.totalAmount;
        let discount = 0;
        if (discountCode) {
            const discounts = {
                WELCOME10: 0.1,
                BIRTHDAY: 0.15,
                STUDENT: 0.1,
            };
            if (discounts[discountCode.toUpperCase()]) {
                discount = subtotal * discounts[discountCode.toUpperCase()];
            }
        }
        const discountedTotal = subtotal - discount;
        const tax = discountedTotal * 0.08;
        const tip = tipAmount || 0;
        const finalTotal = discountedTotal + tax + tip;
        const itemsList = order.items
            .map((item) => `${item.quantity}x ${item.name}${item.modifications?.length
            ? ` (${item.modifications.join(", ")})`
            : ""} - $${(item.price * item.quantity).toFixed(2)}`)
            .join("\n  ");
        const paymentMethodDisplay = {
            cash: "💵 Cash",
            credit_card: "💳 Credit Card",
            debit_card: "💳 Debit Card",
            digital_wallet: "📱 Digital Wallet",
            gift_card: "🎁 Gift Card",
        };
        return {
            content: [
                {
                    type: "text",
                    text: `🧾 ITEMIZED BILL - Table ${order.tableNumber}\nOrder #${order.id}\n\n📝 Items:\n  ${itemsList}\n\n💰 Subtotal: $${subtotal.toFixed(2)}\n${discount > 0
                        ? `🎟️ Discount (${discountCode}): -$${discount.toFixed(2)}\n`
                        : ""}📊 Tax (8%): $${tax.toFixed(2)}\n${tip > 0 ? `💡 Tip: $${tip.toFixed(2)}\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💵 TOTAL: $${finalTotal.toFixed(2)}\n\n${paymentMethodDisplay[paymentMethod]} - Payment ${splitBill ? "will be split among party members" : "processed"}\n\n✅ Thank you for dining with us! Have a wonderful day!`,
                },
            ],
        };
    }
    async handleCheckTableStatus(args) {
        const { tableNumber, partySize, showAll } = args;
        if (showAll) {
            const tableStatus = mockTables
                .map((table) => {
                const statusEmoji = {
                    available: "🟢",
                    occupied: "🔴",
                    reserved: "🟡",
                    dirty: "🟤",
                };
                return `${statusEmoji[table.status]} Table ${table.tableNumber} (${table.capacity} seats) - ${table.status}${table.currentGuests > 0 ? ` (${table.currentGuests} guests)` : ""}`;
            })
                .join("\n");
            return {
                content: [
                    {
                        type: "text",
                        text: `🍽️ RESTAURANT TABLE STATUS\n\n${tableStatus}\n\n🟢 Available  🟡 Reserved  🔴 Occupied  🟤 Needs cleaning`,
                    },
                ],
            };
        }
        if (tableNumber) {
            const table = mockTables.find((t) => t.tableNumber === tableNumber);
            if (!table) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Table ${tableNumber} not found.`,
                        },
                    ],
                };
            }
            const statusDescriptions = {
                available: "✅ Available for immediate seating",
                occupied: `❌ Currently occupied${table.currentGuests ? ` by ${table.currentGuests} guests` : ""}`,
                reserved: "🟡 Reserved for upcoming reservation",
                dirty: "🧹 Being cleaned, available shortly",
            };
            return {
                content: [
                    {
                        type: "text",
                        text: `🍽️ Table ${tableNumber} Status:\n${statusDescriptions[table.status]}\nCapacity: ${table.capacity} guests`,
                    },
                ],
            };
        }
        if (partySize) {
            const availableTables = mockTables.filter((t) => t.capacity >= partySize && t.status === "available");
            if (availableTables.length === 0) {
                const nextBestOptions = mockTables.filter((t) => t.capacity >= partySize && t.status === "dirty");
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ No tables immediately available for ${partySize} guests.${nextBestOptions.length
                                ? `\n\n🧹 Tables being prepared: ${nextBestOptions
                                    .map((t) => `Table ${t.tableNumber}`)
                                    .join(", ")} (available in ~10 minutes)`
                                : "\n\nShall I add you to our waitlist or check for upcoming availability?"}`,
                        },
                    ],
                };
            }
            const tableOptions = availableTables
                .map((t) => `Table ${t.tableNumber} (${t.capacity} seats)`)
                .join(", ");
            return {
                content: [
                    {
                        type: "text",
                        text: `✅ Available tables for ${partySize} guests:\n${tableOptions}\n\nWould you like me to seat you at one of these tables?`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: "Please specify a table number, party size, or use showAll to see complete table status.",
                },
            ],
        };
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
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Enhanced Restaurant Waiter MCP Server running on stdio");
    }
}
const server = new RestaurantMCPServer();
server.run().catch(console.error);
