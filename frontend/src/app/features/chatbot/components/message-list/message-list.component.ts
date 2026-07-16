import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message-list',
  template: `
    <div class="message-list">
      <div *ngFor="let msg of messages"
           class="message"
           [class.message-customer]="msg.senderType === 'CUSTOMER'"
           [class.message-agent]="msg.senderType === 'AGENT'"
           [class.message-ai]="msg.senderType === 'AI_BOT'">
        <div class="message-sender">{{ msg.senderName || msg.senderType }}</div>
        <div class="message-content">{{ msg.content }}</div>
        <div class="message-time">{{ msg.createdAt | date:'HH:mm' }}</div>
      </div>
    </div>
  `,
  styles: [`
    .message-list { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .message { max-width: 70%; padding: 10px 14px; border-radius: 12px; }
    .message-customer { align-self: flex-end; background: #1565c0; color: white; }
    .message-agent { align-self: flex-start; background: #f5f5f5; }
    .message-ai { align-self: flex-start; background: #e8f5e9; }
    .message-sender { font-size: 11px; font-weight: 600; margin-bottom: 4px; opacity: 0.7; }
    .message-time { font-size: 10px; margin-top: 4px; opacity: 0.6; text-align: right; }
  `]
})
export class MessageListComponent {
  @Input() messages: Message[] = [];
}
