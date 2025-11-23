export interface MenuItem {
  id: string;
  name: string;
  category: "appetizers" | "mains" | "desserts" | "drinks";
  price: number; // in INR (Indian Rupees)
  description: string;
  ingredients: string[];
  allergens: string[];
  preparationTime: number; // minutes
  available: boolean;
  modifications?: string[];
}

export interface MenuKnowledgeBase {
  items: MenuItem[];
  categories: string[];
  allergens: string[];
}

export const menuKB: MenuKnowledgeBase = {
  items: [
    // Appetizers
    {
      id: "appetizer_001",
      name: "Samosas",
      category: "appetizers",
      price: 150,
      description:
        "Crispy triangular pastries filled with spiced potatoes, peas, and onions",
      ingredients: [
        "flour",
        "potatoes",
        "peas",
        "onions",
        "cumin",
        "coriander",
        "turmeric",
        "oil",
      ],
      allergens: ["gluten"],
      preparationTime: 12,
      available: true,
      modifications: ["extra spicy", "mild spice", "no onions"],
    },
    {
      id: "appetizer_002",
      name: "Pakoras",
      category: "appetizers",
      price: 180,
      description:
        "Mixed vegetable fritters in spiced chickpea batter served with mint chutney",
      ingredients: [
        "chickpea flour",
        "onions",
        "spinach",
        "potatoes",
        "ginger",
        "green chilies",
        "mint",
        "coriander",
      ],
      allergens: [],
      preparationTime: 15,
      available: true,
      modifications: ["extra crispy", "mild spice", "no green chilies"],
    },
    {
      id: "appetizer_003",
      name: "Paneer Tikka",
      category: "appetizers",
      price: 250,
      description:
        "Marinated cottage cheese cubes grilled in tandoor with bell peppers and onions",
      ingredients: [
        "paneer",
        "yogurt",
        "ginger-garlic paste",
        "garam masala",
        "bell peppers",
        "onions",
        "lemon juice",
      ],
      allergens: ["dairy"],
      preparationTime: 18,
      available: true,
      modifications: ["extra charred", "mild marinade", "no onions"],
    },

    // Main Courses
    {
      id: "main_001",
      name: "Chicken Tikka Masala",
      category: "mains",
      price: 350,
      description:
        "Tender chicken tikka in creamy tomato-based curry with aromatic spices",
      ingredients: [
        "chicken",
        "tomatoes",
        "cream",
        "onions",
        "ginger",
        "garlic",
        "garam masala",
        "fenugreek",
      ],
      allergens: ["dairy"],
      preparationTime: 20,
      available: true,
      modifications: [
        "extra spicy",
        "mild",
        "dairy-free coconut milk",
        "extra cream",
      ],
    },
    {
      id: "main_002",
      name: "Lamb Biryani",
      category: "mains",
      price: 450,
      description:
        "Fragrant basmati rice layered with spiced lamb, saffron, and caramelized onions",
      ingredients: [
        "basmati rice",
        "lamb",
        "saffron",
        "onions",
        "yogurt",
        "mint",
        "cardamom",
        "cinnamon",
      ],
      allergens: ["dairy"],
      preparationTime: 35,
      available: true,
      modifications: [
        "extra saffron",
        "mild spice",
        "no onions",
        "chicken substitute",
      ],
    },
    {
      id: "main_003",
      name: "Palak Paneer",
      category: "mains",
      price: 300,
      description:
        "Fresh cottage cheese in creamy spinach curry with traditional spices",
      ingredients: [
        "paneer",
        "spinach",
        "cream",
        "onions",
        "tomatoes",
        "cumin",
        "coriander",
        "garam masala",
      ],
      allergens: ["dairy"],
      preparationTime: 18,
      available: true,
      modifications: ["vegan tofu", "extra creamy", "mild spice", "no cream"],
    },
    {
      id: "main_004",
      name: "Dal Makhani",
      category: "mains",
      price: 280,
      description:
        "Rich and creamy black lentils slow-cooked with butter and aromatic spices",
      ingredients: [
        "black lentils",
        "kidney beans",
        "butter",
        "cream",
        "tomatoes",
        "ginger",
        "garlic",
        "cumin",
      ],
      allergens: ["dairy"],
      preparationTime: 25,
      available: true,
      modifications: [
        "vegan coconut milk",
        "less butter",
        "extra creamy",
        "mild spice",
      ],
    },
    {
      id: "main_005",
      name: "Fish Curry",
      category: "mains",
      price: 400,
      description:
        "Fresh fish cooked in coconut milk with curry leaves, mustard seeds, and tamarind",
      ingredients: [
        "fish",
        "coconut milk",
        "curry leaves",
        "mustard seeds",
        "tamarind",
        "green chilies",
        "turmeric",
      ],
      allergens: [],
      preparationTime: 22,
      available: true,
      modifications: [
        "extra coconut",
        "mild spice",
        "no tamarind",
        "extra curry leaves",
      ],
    },
    {
      id: "main_006",
      name: "Tandoori Chicken",
      category: "mains",
      price: 380,
      description:
        "Half chicken marinated in yogurt and spices, cooked in traditional tandoor oven",
      ingredients: [
        "chicken",
        "yogurt",
        "lemon juice",
        "red chili powder",
        "turmeric",
        "garam masala",
        "ginger-garlic paste",
      ],
      allergens: ["dairy"],
      preparationTime: 30,
      available: true,
      modifications: [
        "extra charred",
        "mild marinade",
        "boneless pieces",
        "extra lemon",
      ],
    },

    // Desserts
    {
      id: "dessert_001",
      name: "Gulab Jamun",
      category: "desserts",
      price: 120,
      description:
        "Soft milk dumplings in sweet rose-flavored syrup with cardamom",
      ingredients: [
        "milk powder",
        "flour",
        "ghee",
        "sugar",
        "rose water",
        "cardamom",
      ],
      allergens: ["gluten", "dairy"],
      preparationTime: 8,
      available: true,
      modifications: ["extra syrup", "less sweet", "warm serving"],
    },
    {
      id: "dessert_002",
      name: "Ras Malai",
      category: "desserts",
      price: 140,
      description:
        "Soft cottage cheese dumplings in sweetened cardamom milk with pistachios",
      ingredients: [
        "paneer",
        "milk",
        "sugar",
        "cardamom",
        "pistachios",
        "saffron",
      ],
      allergens: ["dairy", "nuts"],
      preparationTime: 5,
      available: true,
      modifications: ["extra pistachios", "no nuts", "extra saffron"],
    },
    {
      id: "dessert_003",
      name: "Kulfi",
      category: "desserts",
      price: 100,
      description:
        "Traditional Indian ice cream with cardamom, almonds, and pistachios",
      ingredients: [
        "milk",
        "sugar",
        "cardamom",
        "almonds",
        "pistachios",
        "condensed milk",
      ],
      allergens: ["dairy", "nuts"],
      preparationTime: 3,
      available: true,
      modifications: ["no nuts", "mango flavor", "extra cardamom"],
    },

    // Drinks
    {
      id: "drink_001",
      name: "Mango Lassi",
      category: "drinks",
      price: 80,
      description: "Creamy yogurt drink blended with fresh mango and cardamom",
      ingredients: ["yogurt", "mango", "sugar", "cardamom", "ice"],
      allergens: ["dairy"],
      preparationTime: 3,
      available: true,
      modifications: ["extra mango", "less sweet", "vegan coconut yogurt"],
    },
    {
      id: "drink_002",
      name: "Masala Chai",
      category: "drinks",
      price: 60,
      description:
        "Traditional spiced tea with cardamom, ginger, cinnamon, and milk",
      ingredients: [
        "black tea",
        "milk",
        "cardamom",
        "ginger",
        "cinnamon",
        "cloves",
        "sugar",
      ],
      allergens: ["dairy"],
      preparationTime: 5,
      available: true,
      modifications: ["extra spicy", "oat milk", "no sugar", "extra strong"],
    },
    {
      id: "drink_003",
      name: "Fresh Lime Water",
      category: "drinks",
      price: 50,
      description: "Refreshing lime juice with mint, salt, and chaat masala",
      ingredients: [
        "lime juice",
        "water",
        "mint",
        "salt",
        "chaat masala",
        "ice",
      ],
      allergens: [],
      preparationTime: 2,
      available: true,
      modifications: ["extra mint", "sweet version", "no salt"],
    },
    {
      id: "drink_004",
      name: "Rose Milk",
      category: "drinks",
      price: 70,
      description:
        "Chilled milk flavored with rose syrup and garnished with almonds",
      ingredients: ["milk", "rose syrup", "sugar", "almonds", "ice"],
      allergens: ["dairy", "nuts"],
      preparationTime: 3,
      available: true,
      modifications: ["extra rose", "no nuts", "coconut milk"],
    },
    {
      id: "drink_005",
      name: "Buttermilk (Chaas)",
      category: "drinks",
      price: 50,
      description:
        "Spiced yogurt drink with cumin, black salt, and fresh coriander",
      ingredients: [
        "yogurt",
        "water",
        "cumin",
        "black salt",
        "coriander",
        "green chilies",
      ],
      allergens: ["dairy"],
      preparationTime: 3,
      available: true,
      modifications: ["extra spicy", "mild", "no chilies"],
    },
  ],
  categories: ["appetizers", "mains", "desserts", "drinks"],
  allergens: ["gluten", "dairy", "nuts", "shellfish", "eggs", "soy"],
};

export function queryMenu(itemName?: string, category?: string) {
  if (itemName) {
    return menuKB.items.filter((item) =>
      item.name.toLowerCase().includes(itemName.toLowerCase())
    );
  }
  if (category) {
    return menuKB.items.filter((item) => item.category === category);
  }
  return menuKB.items;
}

export function getMenuByCategory() {
  const grouped: Record<string, MenuItem[]> = {};
  menuKB.categories.forEach((category) => {
    grouped[category] = menuKB.items.filter(
      (item) => item.category === category
    );
  });
  return grouped;
}

export function checkAllergens(allergenList: string[]) {
  return menuKB.items.filter(
    (item) =>
      !item.allergens.some((allergen) => allergenList.includes(allergen))
  );
}

export function getMenuItem(itemId: string) {
  return menuKB.items.find((item) => item.id === itemId);
}
