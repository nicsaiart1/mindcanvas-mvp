export interface Position {
  x: number;
  y: number;
}

export interface Intention {
  id: string;
  title: string;
  originalVoiceInput: string;
  description: string;
  status: 'listening' | 'processing' | 'active' | 'fulfilled';
  position: Position;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
  attachments: Attachment[];
  userContext: string[];
  aiProgress: number; // 0-100
}

export interface Task {
  id: string;
  intentionId: string;
  title: string;
  description: string;
  status: 'spawning' | 'executing' | 'completed';
  position: Position;
  createdAt: Date;
  aiReasoning: string;
  relatedAttachments: string[]; // attachment IDs
}

export interface Attachment {
  id: string;
  filename: string;
  type: 'document' | 'image' | 'spreadsheet' | 'text';
  content: string; // extracted text content
  metadata: Record<string, any>;
  uploadedAt: Date;
}

export interface Session {
  id: string;
  name: string;
  createdAt: Date;
  lastModified: Date;
  intentions: Intention[];
  canvasState: CanvasState;
  tags: string[];
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface DragItem {
  id: string;
  type: 'intention' | 'task';
  position: Position;
}

export type IntentionStatus = Intention['status'];
export type TaskStatus = Task['status'];
export type AttachmentType = Attachment['type'];