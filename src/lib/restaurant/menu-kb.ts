/**
 * Menu Knowledge Base for Spice Garden Indian Restaurant
 * Contains detailed information about all menu items including ingredients, allergens, and pricing
 */

export type MenuCategory = "appetizers" | "mains" | "breads" | "beverages" | "desserts";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number; // in INR (Indian Rupees)
  ingredients: string[];
  allergens: string[];
  spiceLevel: 0 | 1 | 2 | 3; // 0 = mild, 3 = very spicy
  isVegetarian: boolean;
  isVegan: boolean;
  prepTime: number; // estimated prep time in minutes
  imageUrl?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  // Appetizers
  {
    id: "app-001",
    name: "Samosa (2 pcs)",
    description: "Crispy pastry filled with spiced potatoes and peas",
    category: "appetizers",
    price: 100,
    ingredients: ["potatoes", "peas", "flour", "cumin", "coriander", "oil"],
    allergens: ["gluten"],
    spiceLevel: 1,
    isVegetarian: true,
    isVegan: true,
    prepTime: 10,
  },
  {
    id: "app-002",
    name: "Chicken Tikka",
    description: "Marinated chicken pieces grilled in tandoor",
    category: "appetizers",
    price: 180,
    ingredients: ["chicken", "yogurt", "ginger", "garlic", "garam masala", "lemon"],
    allergens: ["dairy"],
    spiceLevel: 2,
    isVegetarian: false,
    isVegan: false,
    prepTime: 15,
  },
  {
    id: "app-003",
    name: "Paneer Pakora",
    description: "Indian cottage cheese fritters with chickpea batter",
    category: "appetizers",
    price: 150,
    ingredients: ["paneer", "chickpea flour", "spices", "oil"],
    allergens: ["dairy"],
    spiceLevel: 1,
    isVegetarian: true,
    isVegan: false,
    prepTime: 12,
  },

  // Main Dishes
  {
    id: "main-001",
    name: "Chicken Tikka Masala",
    description: "Tender chicken in creamy tomato sauce with aromatic spices",
    category: "mains",
    price: 300,
    ingredients: ["chicken", "tomatoes", "cream", "onions", "ginger", "garlic", "garam masala", "fenugreek"],
    allergens: ["dairy"],
    spiceLevel: 2,
    isVegetarian: false,
    isVegan: false,
    prepTime: 25,
  },
  {
    id: "main-002",
    name: "Palak Paneer",
    description: "Spinach curry with cubes of cottage cheese",
    category: "mains",
    price: 250,
    ingredients: ["spinach", "paneer", "onions", "tomatoes", "cream", "cumin", "garam masala"],
    allergens: ["dairy"],
    spiceLevel: 1,
    isVegetarian: true,
    isVegan: false,
    prepTime: 20,
  },
  {
    id: "main-003",
    name: "Lamb Rogan Josh",
    description: "Aromatic lamb curry with Kashmiri spices",
    category: "mains",
    price: 350,
    ingredients: ["lamb", "yogurt", "tomatoes", "onions", "kashmiri chili", "cardamom", "cinnamon"],
    allergens: ["dairy"],
    spiceLevel: 3,
    isVegetarian: false,
    isVegan: false,
    prepTime: 30,
  },
  {
    id: "main-004",
    name: "Chana Masala",
    description: "Chickpeas in tangy tomato-based sauce",
    category: "mains",
    price: 220,
    ingredients: ["chickpeas", "tomatoes", "onions", "ginger", "garlic", "cumin", "coriander"],
    allergens: [],
    spiceLevel: 2,
    isVegetarian: true,
    isVegan: true,
    prepTime: 18,
  },
  {
    id: "main-005",
    name: "Butter Chicken",
    description: "Classic Delhi-style chicken in rich buttery tomato sauce",
    category: "mains",
    price: 320,
    ingredients: ["chicken", "butter", "cream", "tomatoes", "fenugreek", "garam masala", "honey"],
    allergens: ["dairy"],
    spiceLevel: 1,
    isVegetarian: false,
    isVegan: false,
    prepTime: 25,
  },

  // Breads
  {
    id: "bread-001",
    name: "Garlic Naan",
    description: "Tandoor-baked flatbread with garlic and butter",
    category: "breads",
    price: 80,
    ingredients: ["flour", "yogurt", "garlic", "butter", "yeast"],
    allergens: ["gluten", "dairy"],
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    prepTime: 8,
  },
  {
    id: "bread-002",
    name: "Plain Naan",
    description: "Traditional tandoor-baked flatbread",
    category: "breads",
    price: 60,
    ingredients: ["flour", "yogurt", "yeast", "salt"],
    allergens: ["gluten", "dairy"],
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    prepTime: 8,
  },
  {
    id: "bread-003",
    name: "Roti (Wheat Bread)",
    description: "Whole wheat flatbread",
    category: "breads",
    price: 50,
    ingredients: ["whole wheat flour", "water", "salt"],
    allergens: ["gluten"],
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: true,
    prepTime: 5,
  },

  // Beverages
  {
    id: "bev-001",
    name: "Mango Lassi",
    description: "Refreshing yogurt drink with mango",
    category: "beverages",
    price: 100,
    ingredients: ["yogurt", "mango", "sugar", "cardamom"],
    allergens: ["dairy"],
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    prepTime: 3,
  },
  {
    id: "bev-002",
    name: "Masala Chai",
    description: "Spiced Indian tea with milk",
    category: "beverages",
    price: 70,
    ingredients: ["black tea", "milk", "ginger", "cardamom", "cinnamon", "sugar"],
    allergens: ["dairy"],
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    prepTime: 5,
  },

  // Desserts
  {
    id: "des-001",
    name: "Gulab Jamun",
    description: "Sweet milk-solid dumplings in rose syrup",
    category: "desserts",
    price: 120,
    ingredients: ["milk solids", "flour", "sugar", "rose water", "cardamom"],
    allergens: ["dairy", "gluten"],
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    prepTime: 10,
  },
  {
    id: "des-002",
    name: "Kheer (Rice Pudding)",
    description: "Creamy rice pudding with cardamom and nuts",
    category: "desserts",
    price: 100,
    ingredients: ["rice", "milk", "sugar", "cardamom", "almonds", "pistachios"],
    allergens: ["dairy", "nuts"],
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    prepTime: 15,
  },
];

/**
 * Query menu items by various criteria
 */
export class MenuKnowledgeBase {
  private items: MenuItem[];

  constructor() {
    this.items = MENU_ITEMS;
  }

  /**
   * Get all menu items
   */
  getAllItems(): MenuItem[] {
    return this.items;
  }

  /**
   * Get item by ID
   */
  getItemById(id: string): MenuItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  /**
   * Search items by name (case-insensitive, partial match)
   */
  searchByName(query: string): MenuItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.items.filter((item) =>
      item.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get items by category
   */
  getItemsByCategory(category: MenuCategory): MenuItem[] {
    return this.items.filter((item) => item.category === category);
  }

  /**
   * Filter items safe for specific allergens (items WITHOUT the allergen)
   */
  safeForAllergens(allergens: string[]): MenuItem[] {
    return this.items.filter((item) =>
      allergens.every((allergen) => !item.allergens.includes(allergen.toLowerCase()))
    );
  }

  /**
   * Get vegetarian items
   */
  getVegetarianItems(): MenuItem[] {
    return this.items.filter((item) => item.isVegetarian);
  }

  /**
   * Get vegan items
   */
  getVeganItems(): MenuItem[] {
    return this.items.filter((item) => item.isVegan);
  }

  /**
   * Get items by maximum spice level
   */
  getItemsByMaxSpiceLevel(maxLevel: 0 | 1 | 2 | 3): MenuItem[] {
    return this.items.filter((item) => item.spiceLevel <= maxLevel);
  }

  /**
   * Get items by price range
   */
  getItemsByPriceRange(min: number, max: number): MenuItem[] {
    return this.items.filter((item) => item.price >= min && item.price <= max);
  }

  /**
   * Get full menu organized by category
   */
  getMenuByCategory(): Record<MenuCategory, MenuItem[]> {
    return {
      appetizers: this.getItemsByCategory("appetizers"),
      mains: this.getItemsByCategory("mains"),
      breads: this.getItemsByCategory("breads"),
      beverages: this.getItemsByCategory("beverages"),
      desserts: this.getItemsByCategory("desserts"),
    };
  }
}

// Singleton instance
let menuKBInstance: MenuKnowledgeBase | null = null;

export function getMenuKB(): MenuKnowledgeBase {
  if (!menuKBInstance) {
    menuKBInstance = new MenuKnowledgeBase();
  }
  return menuKBInstance;
}
