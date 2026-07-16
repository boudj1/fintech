// ── Auth Models ──────────────────────────────────────────────────────────
export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { username: string; email: string; password: string; firstName: string; lastName: string; }
export interface TokenResponse {
  accessToken: string; refreshToken: string; tokenType: string;
  expiresIn: number; user: User;
}
export interface User {
  id: number; username: string; email: string;
  firstName: string; lastName: string; role: string;
}

// ── Conversation Models ───────────────────────────────────────────────────
export type ConversationStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';
export type ConversationChannel = 'WEB' | 'EMAIL' | 'PHONE' | 'CHAT';
export type SenderType = 'CUSTOMER' | 'AGENT' | 'BOT';

export interface Conversation {
  id: number; customerId: number | null; customerName: string;
  assignedAgentId: number | null; assignedAgentName: string;
  subject: string; status: ConversationStatus; channel: ConversationChannel;
  language: string; satisfactionScore: number | null;
  messageCount: number; resolvedAt: string | null;
  createdAt: string; updatedAt: string;
}

export interface ConversationMessage {
  id: number; conversationId: number; content: string;
  senderType: SenderType; senderId: number | null; senderName: string;
  aiGenerated: boolean; confidenceScore: number | null; createdAt: string;
}

export interface ConversationStats {
  total: number; open: number; inProgress: number;
  resolved: number; escalated: number; avgSatisfactionScore: number | null;
}

export interface CreateConversationRequest {
  customerId?: number; subject: string;
  channel?: ConversationChannel; language?: string; initialMessage: string;
}

export interface SendMessageRequest {
  content: string; senderType?: SenderType; senderName?: string;
}

export interface Page<T> {
  content: T[]; totalElements: number; totalPages: number; size: number; number: number;
}

// ── Notification Models ───────────────────────────────────────────────────
export interface Notification {
  id: number; userId: number; title: string; message: string;
  type: string; status: 'READ' | 'UNREAD'; entityType: string | null;
  entityId: number | null; createdAt: string; readAt: string | null;
}

// ── Chatbot Models ────────────────────────────────────────────────────────
export interface ChatMessage { role: 'user' | 'bot'; text: string; time: string; intent?: string; escalate?: boolean; }
export interface ChatRequest { message: string; session_id?: string; }
export interface ChatResponse { response: string; session_id: string; intent: string; language: string; confidence: number; should_escalate: boolean; }
