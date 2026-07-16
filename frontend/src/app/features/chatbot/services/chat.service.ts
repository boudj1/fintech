import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PageResponse } from '../../../core/services/api.service';
import { ChatSession, ChatSessionStats, Message, SendMessageRequest } from '../models/message.model';

@Injectable()
export class ChatService {
  private readonly basePath = '/v1/chat';

  constructor(private api: ApiService) {}

  getSessions(page = 0, size = 20): Observable<PageResponse<ChatSession>> {
    return this.api.get<PageResponse<ChatSession>>(`${this.basePath}/sessions`, { page, size });
  }

  getSessionById(id: number): Observable<ChatSession> {
    return this.api.get<ChatSession>(`${this.basePath}/sessions/${id}`);
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return this.api.get<Message[]>(`${this.basePath}/sessions/${conversationId}/messages`);
  }

  sendMessage(conversationId: number, request: SendMessageRequest): Observable<Message> {
    return this.api.post<Message>(`${this.basePath}/send?conversationId=${conversationId}`, request);
  }

  getStats(): Observable<ChatSessionStats> {
    return this.api.get<ChatSessionStats>(`${this.basePath}/stats`);
  }
}
