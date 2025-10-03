export interface Note {
  id: string;
  text: string;
  imageUrl?: string;
  /** Optional reminder date in YYYY-MM-DD */
  date?: string;
  createdAt: string;
}

export interface NoteRecord {
  id: string | number;
  user_id?: string;
  text: string;
  image_url?: string | null;
  date?: string | null;
  created_at: string;
}

export function mapRecordToNote(record: NoteRecord): Note {
  return {
    id: String(record.id),
    text: record.text,
    imageUrl: record.image_url || undefined,
    date: record.date || undefined,
    createdAt: record.created_at,
  };
}
