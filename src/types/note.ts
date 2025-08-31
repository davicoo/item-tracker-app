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

export interface NoteRecord {
  id: string;
  user_id?: string;
  title: string;
  item_type?: string | null;
  sku?: string | null;
  store?: string | null;
  text: string;
  image_url?: string | null;
  date?: string | null;
  created_at: string;
}

export function mapRecordToNote(record: NoteRecord): Note {
  return {
    id: String(record.id),
    title: record.title,
    itemType: record.item_type || '',
    sku: record.sku || '',
    store: record.store || '',
    text: record.text,
    imageUrl: record.image_url || undefined,
    date: record.date || undefined,
    createdAt: record.created_at,
  };
}
