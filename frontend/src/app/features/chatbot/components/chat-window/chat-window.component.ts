import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/message.model';
import { MessageListComponent } from '../message-list/message-list.component';
import { InputAreaComponent } from '../input-area/input-area.component';

@Component({
  selector: 'app-chat-window',
  template: `
    <div class="chat-window">
      <div class="chat-header">
        <h3>Conversation #{{ conversationId }}</h3>
      </div>
      <app-message-list [messages]="messages"></app-message-list>
      <app-input-area (messageSent)="onMessageSent($event)"></app-input-area>
    </div>
  `,
  styles: [`
    .chat-window { display: flex; flex-direction: column; height: 100%; }
    .chat-header { padding: 16px; border-bottom: 1px solid #e0e0e0; }
  `]
})
export class ChatWindowComponent implements OnInit {
  conversationId!: number;
  messages: Message[] = [];

  constructor(private route: ActivatedRoute, private chatService: ChatService) {}

  ngOnInit(): void {
    this.conversationId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMessages();
  }

  loadMessages(): void {
    this.chatService.getMessages(this.conversationId).subscribe(messages => {
      this.messages = messages;
    });
  }

  onMessageSent(content: string): void {
    this.chatService.sendMessage(this.conversationId, {
      content,
      senderType: 'CUSTOMER'
    }).subscribe(() => this.loadMessages());
  }
}
