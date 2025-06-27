export interface Item {
  id: string;
  /** User that created the item */
  userId?: string;
  name: string;
  imageUrl: string;
  details: string;
  /** How many of this item exist */
  quantity: number;
  /** Optional list of SKU codes for individual units */
  skuCodes: string[];
  status: "not_sold" | "sold" | "sold_paid";
  dateAdded: string;
  location: string;
  price: string;
  feePercent: number;
  tags: string[];
}

export const statusOptions = [
  { value: "not_sold", label: "Not Sold" },
  { value: "sold", label: "Sold" },
  { value: "sold_paid", label: "Paid" }
] as const;

export function mapRecordToItem(record: any): Item {
  let tags: string[] = [];
  if (Array.isArray(record.tags)) {
    tags = record.tags;
  } else if (typeof record.tags === 'string') {
    try {
      const parsed = JSON.parse(record.tags);
      if (Array.isArray(parsed)) {
        tags = parsed;
      }
    } catch {
      // leave tags as empty array
    }
  }

  let skuCodes: string[] = [];
  if (Array.isArray(record.sku_codes)) {
    skuCodes = record.sku_codes;
  } else if (typeof record.sku_codes === 'string') {
    try {
      const parsed = JSON.parse(record.sku_codes);
      if (Array.isArray(parsed)) {
        skuCodes = parsed;
      } else if (parsed) {
        skuCodes = String(parsed).split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    } catch {
      skuCodes = record.sku_codes.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return {
    id: record.id,
    userId: record.user_id,
    name: record.name,
    imageUrl: record.image_url ?? '',
    details: record.details,
    quantity: typeof record.quantity === 'number' ? record.quantity : 1,
    skuCodes,
    status: record.status,
    dateAdded: record.date_added,
    location: record.location,
    price: record.price,
    feePercent: typeof record.fee_percent === 'number' ? record.fee_percent : 20,
    tags

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
    quantity: 1,
    skuCodes: [],
    status: "not_sold",
    dateAdded: new Date().toISOString(),
    location: "New York, NY",
    price: "199.99",
    feePercent: 20,
    tags: []
  },
  {
    id: "2",
    name: "Antique Chair",
    imageUrl: "https://ik.imagekit.io/mydwcapp/placeholder-image-1.jpg",
    details: "Hand-carved wooden chair from the early 1900s.",
    quantity: 1,
    skuCodes: [],
    status: "sold",
    dateAdded: new Date().toISOString(),
    location: "San Francisco, CA",
    price: "899.99",
    feePercent: 20,
    tags: []
  }
];

