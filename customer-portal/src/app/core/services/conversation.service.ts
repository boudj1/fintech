import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Conversation, ConversationMessage, ConversationStats,
  CreateConversationRequest, SendMessageRequest, Page, ConversationStatus
} from '../models';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly base = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<ConversationStats> {
    return this.http.get<ConversationStats>(`${this.base}/stats`);
  }

  getAll(page = 0, size = 20, status?: ConversationStatus): Observable<Page<Conversation>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<Conversation>>(this.base, { params });
  }

  getById(id: number): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.base}/${id}`);
  }

  getMessages(id: number): Observable<ConversationMessage[]> {
    return this.http.get<ConversationMessage[]>(`${this.base}/${id}/messages`);
  }

  create(req: CreateConversationRequest): Observable<Conversation> {
    return this.http.post<Conversation>(this.base, req);
  }

  sendMessage(id: number, req: SendMessageRequest): Observable<ConversationMessage> {
    return this.http.post<ConversationMessage>(`${this.base}/${id}/messages`, req);
  }

  updateStatus(id: number, status: ConversationStatus): Observable<Conversation> {
    return this.http.put<Conversation>(`${this.base}/${id}`, { status });
  }

  rate(id: number, score: number): Observable<Conversation> {
    return this.http.put<Conversation>(`${this.base}/${id}`, { satisfactionScore: score });
  }
}
