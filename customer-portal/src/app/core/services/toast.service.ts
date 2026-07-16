import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; type: 'success'|'error'|'warning'|'info'; title: string; message?: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private next = 0;

  show(type: Toast['type'], title: string, message?: string, duration = 4000): void {
    const id = ++this.next;
    this.toasts.update(t => [...t, { id, type, title, message }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(title: string, msg?: string): void { this.show('success', title, msg); }
  error(title: string, msg?: string): void { this.show('error', title, msg); }
  warning(title: string, msg?: string): void { this.show('warning', title, msg); }
  info(title: string, msg?: string): void { this.show('info', title, msg); }

  remove(id: number): void { this.toasts.update(t => t.filter(x => x.id !== id)); }
}
