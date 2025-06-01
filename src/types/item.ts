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