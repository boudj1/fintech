import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatRequest, ChatResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly base = `${environment.chatbotUrl}/api/chatbot`;
  private sessionId: string | null = null;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatResponse> {
    const req: ChatRequest = { message };
    if (this.sessionId) req.session_id = this.sessionId;
    return this.http.post<ChatResponse>(`${this.base}/message`, req);
  }

  setSessionId(id: string): void { this.sessionId = id; }
  getSessionId(): string | null { return this.sessionId; }

  getHistory(): Observable<{ session_id: string; history: Array<{ role: string; content: string }> }> {
    return this.http.get<any>(`${this.base}/session/${this.sessionId}/history`);
  }

  clearSession(): void {
    if (this.sessionId) {
      this.http.delete(`${this.base}/session/${this.sessionId}`).subscribe({ error: () => {} });
      this.sessionId = null;
    }
  }
}
