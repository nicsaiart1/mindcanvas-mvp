import type { Session, Attachment } from './canvas';

export interface StorageDatabase {
  sessions: Session;
  attachments: Attachment;
}

export interface SearchOptions {
  query: string;
  includeContent?: boolean;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt';
  includeAttachments?: boolean;
  sessionIds?: string[];
}

export interface ImportResult {
  success: boolean;
  sessionsImported: number;
  errors: string[];
}