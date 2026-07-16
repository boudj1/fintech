import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-area',
  template: `
    <div class="input-area">
      <textarea
        [(ngModel)]="messageText"
        (keydown.enter)="$event.preventDefault(); send()"
        placeholder="Type your message..."
        rows="2">
      </textarea>
      <button (click)="send()" [disabled]="!messageText.trim()">Send</button>
    </div>
  `,
  styles: [`
    .input-area { display: flex; gap: 8px; padding: 16px; border-top: 1px solid #e0e0e0; }
    textarea { flex: 1; resize: none; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 0 24px; background: #1565c0; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class InputAreaComponent {
  @Output() messageSent = new EventEmitter<string>();

  messageText = '';

  send(): void {
    const text = this.messageText.trim();
    if (!text) return;
    this.messageSent.emit(text);
    this.messageText = '';
  }
}
