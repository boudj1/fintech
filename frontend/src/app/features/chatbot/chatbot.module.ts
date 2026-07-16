import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotRoutingModule } from './chatbot-routing.module';
import { ChatService } from './services/chat.service';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { MessageListComponent } from './components/message-list/message-list.component';
import { InputAreaComponent } from './components/input-area/input-area.component';

@NgModule({
  declarations: [
    ChatWindowComponent,
    MessageListComponent,
    InputAreaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ChatbotRoutingModule
  ],
  providers: [ChatService]
})
export class ChatbotModule {}
