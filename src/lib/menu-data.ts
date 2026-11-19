import salmon from "@/assets/dish-salmon.jpg";
import burger from "@/assets/dish-burger.jpg";
import pasta from "@/assets/dish-pasta.jpg";
import dessert from "@/assets/dish-dessert.jpg";
import heinekenAsset from "@/assets/heineken.jpg.asset.json";
const heineken = heinekenAsset.url;

export type Category = "breakfast" | "lunch" | "dinner" | "drinks" | "desserts" | "special";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  popular?: boolean;
  recommended?: boolean;
  vegetarian?: boolean;
  available: boolean;
}

export const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
  { id: "special", label: "Special Offers" },
];

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Grilled Atlantic Salmon",
    description: "Fresh salmon fillet with lemon-herb butter and seasonal greens.",
    price: 28.5,
    image: salmon,
    category: "dinner",
    popular: true,
    available: true,
  },
  {
    id: "2",
    name: "Wagyu Truffle Burger",
    description: "A5 wagyu patty, aged cheddar, truffle aioli, brioche bun.",
    price: 32.0,
    image: burger,
    category: "lunch",
    recommended: true,
    available: true,
  },
  {
    id: "3",
    name: "Truffle Carbonara",
    description: "Hand-rolled pasta with pecorino, guanciale, and black truffle.",
    price: 24.0,
    image: pasta,
    category: "dinner",
    vegetarian: false,
    available: true,
  },
  {
    id: "4",
    name: "Molten Chocolate Soufflé",
    description: "Warm dark chocolate cake with gold leaf and fresh berries.",
    price: 14.0,
    image: dessert,
    category: "desserts",
    popular: true,
    vegetarian: true,
    available: true,
  },
  {
    id: "5",
    name: "Heineken Lager",
    description: "Premium Dutch lager, ice-cold 330ml bottle served with a chilled glass.",
    price: 120,
    image: heineken,
    category: "drinks",
    popular: true,
    available: true,
  },
];
