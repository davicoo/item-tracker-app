export interface Note {
  id: string;
  title: string;
  itemType: string;
  sku: string;
  store: string;
  text: string;
  imageUrl?: string;
  /** Optional reminder date in YYYY-MM-DD */
  date?: string;
  createdAt: string;
}
