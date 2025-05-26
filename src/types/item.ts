// Define TypeScript interfaces for our item data
export interface Item {
  id: string;
  name: string;
  imageUrl: string;  // Make sure this is 'imageUrl', not 'image'
  details: string;
  status: "not_sold" | "sold" | "sold_paid";
  dateAdded: string;
}

// Add a base64 fallback image - THIS IS THE MISSING PART
export const DEFAULT_FALLBACK_IMAGE = "data:image/png;base64,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";

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
    imageUrl: "https://ik.imagekit.io/mydwcapp/placeholder-image-1.jpg",
    details: "A vintage film camera from the 1970s in excellent condition.",
    status: "not_sold",
    dateAdded: new Date().toISOString() // Add dateAdded property
  },
  {
    id: "2",
    name: "Antique Chair",
    imageUrl: "https://ik.imagekit.io/mydwcapp/placeholder-image-1.jpg?updatedAt=1748135546655",
    details: "Hand-carved wooden chair from the early 1900s.",
    status: "sold",
    dateAdded: new Date().toISOString() // Add dateAdded property
  }
];