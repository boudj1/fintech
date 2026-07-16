export interface Message {
  id: number;
  conversationId: number;
  content: string;
  senderType: SenderType;
  senderId?: number;
  senderName?: string;
  aiGenerated: boolean;
  confidenceScore?: number;
  createdAt: string;
}

export type SenderType = 'CUSTOMER' | 'AGENT' | 'AI_BOT' | 'SYSTEM';

export interface ChatSession {
  id: number;
  customerId?: number;
  customerName?: string;
  assignedAgentId?: number;
  assignedAgentName?: string;
  subject?: string;
  status: ChatStatus;
  channel: ChatChannel;
  language: string;
  satisfactionScore?: number;
  resolvedAt?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ChatStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
export type ChatChannel = 'WEB' | 'EMAIL' | 'PHONE' | 'CHAT' | 'SMS';

export interface SendMessageRequest {
  content: string;
  senderType: SenderType;
  senderId?: number;
  senderName?: string;
}

export interface ChatSessionStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  avgSatisfactionScore?: number;
}
