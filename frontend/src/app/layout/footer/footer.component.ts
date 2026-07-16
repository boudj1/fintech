import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <span>© 2026 Enterprise AI Platform. All rights reserved.</span>
    </footer>
  `,
  styles: [`
    .footer { padding:12px 24px; background:#f5f5f5; border-top:1px solid #e0e0e0; font-size:12px; color:#666; text-align:center; }
  `]
})
export class FooterComponent {}
