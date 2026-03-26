export * from './video';

export interface Expert {
  id: string;
  name: string;
  title: string;
  hospital: string;
  specialty: string;
  avatar: string; // emoji or url
  avatarColor: string;
  description: string;
  systemPrompt: string;
  knowledgeFiles: KnowledgeFile[];
  stats: ExpertStats;
  createdAt: string;
  ollamaModel: string;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'ppt' | 'text';
  size: string;
  uploadedAt: string;
  content?: string; // extracted text content for RAG simulation
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Source[];
  isStreaming?: boolean;
}

export interface Source {
  title: string;
  excerpt: string;
  type: 'video' | 'pdf' | 'guideline';
  timestamp?: string; // for video
  page?: number; // for pdf
}

export interface ExpertStats {
  totalQuestions: number;
  totalSessions: number;
  avgResponseTime: number;
  topTopics: string[];
  weeklyQuestions: number[];
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}
