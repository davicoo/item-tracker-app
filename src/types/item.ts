export interface Item {
  id: string;
  name: string;
  imageUrl: string;
  details: string;
  status: "not_sold" | "sold" | "sold_paid";
  dateAdded: string;
  location: string;
  price: string;
}

export const statusOptions = [
  { value: "not_sold", label: "Not Sold" },
  { value: "sold", label: "Sold" },
  { value: "sold_paid", label: "Sold & Paid" }
] as const;

export function mapRecordToItem(record: any): Item {
  return {
    id: record.id,
    name: record.fields['Name'],
    imageUrl: record.fields['Image']?.[0]?.url ?? '',
    details: record.fields['Details'],
    status: record.fields['Status'],
    dateAdded: record.fields['Date Added'],
    location: record.fields['Location'],
    price: record.fields['Price']
  };
}

export const DEFAULT_FALLBACK_IMAGE = 'https://ik.imagekit.io/mydwcapp/placeholder-image-1.jpg';

// Add this defaultItems export to fix the build error
export const defaultItems: Item[] = [
  {
    id: "1",
    name: "Vintage Camera",
    imageUrl: "https://ik.imagekit.io/mydwcapp/placeholder-image-1.jpg",
    details: "A vintage film camera from the 1970s in excellent condition.",
    status: "not_sold",
    dateAdded: new Date().toISOString(),
    location: "New York, NY",
    price: "199.99"
  },
  {
    id: "2",
    name: "Antique Chair",
    imageUrl: "https://ik.imagekit.io/mydwcapp/placeholder-image-1.jpg",
    details: "Hand-carved wooden chair from the early 1900s.",
    status: "sold",
    dateAdded: new Date().toISOString(),
    location: "San Francisco, CA",
    price: "899.99"
  }
];

