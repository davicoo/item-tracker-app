export interface Folder {
  id: string;
  /** User that owns the folder */
  userId?: string;
  name: string;
  createdAt: string;
}

export interface FolderRecord {
  id: string;
  user_id?: string;
  name: string;
  created_at: string;
}

export function mapRecordToFolder(record: FolderRecord): Folder {
  return {
    id: String(record.id),
    userId: record.user_id,
    name: record.name,
    createdAt: record.created_at,
  };
}
