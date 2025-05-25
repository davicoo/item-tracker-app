// Define TypeScript interfaces for our item data
export interface Item {
  id: string;
  name: string;
  imageUrl: string;
  details: string;
  status: "not_sold" | "sold" | "sold_paid";
  dateAdded: string; // Add this missing property
}

// Status option definition
export interface StatusOption {
  value: "not_sold" | "sold" | "sold_paid";
  label: string;
}

// Status options for dropdown
export const statusOptions: StatusOption[] = [
  { value: "not_sold", label: "Not Sold" },
  { value: "sold", label: "Sold" },
  { value: "sold_paid", label: "Sold & Paid" }
];

// Default items for demonstration
export const defaultItems: Item[] = [
  {
    id: "1",
    name: "Vintage Camera",
    imageUrl: "https://ik.imagekit.io/mydwcapp/tr:h-192,w-400,c-maintain_ratio/images/placeholder-image-1.jpg",
    details: "A vintage film camera from the 1970s in excellent condition.",
    status: "not_sold",
    dateAdded: new Date().toISOString() // Add dateAdded property
  },
  {
    id: "2",
    name: "Antique Chair",
    imageUrl: "https://ik.imagekit.io/mydwcapp/tr:h-192,w-400,c-maintain_ratio/images/placeholder-image-1.jpg",
    details: "Hand-carved wooden chair from the early 1900s.",
    status: "sold",
    dateAdded: new Date().toISOString() // Add dateAdded property
  }
];