// Define TypeScript interfaces for our item data
export interface Item {
  id: string;
  name: string;
  imageUrl: string;  // Make sure this is 'imageUrl', not 'image'
  details: string;
  status: "not_sold" | "sold" | "sold_paid";
  dateAdded: string;
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
    // Use a more reliable placeholder service
    imageUrl: "https://placehold.co/400x300/e2e8f0/1e293b?text=Vintage+Camera",
    details: "A vintage film camera from the 1970s in excellent condition.",
    status: "not_sold",
    dateAdded: new Date().toISOString()
  },
  {
    id: "2",
    name: "Antique Chair",
    // Use a more reliable placeholder service
    imageUrl: "https://placehold.co/400x300/e2e8f0/1e293b?text=Antique+Chair",
    details: "Hand-carved wooden chair from the early 1900s.",
    status: "sold",
    dateAdded: new Date().toISOString()
  }
];