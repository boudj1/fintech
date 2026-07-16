import { Component } from '@angular/core';

/**
 * Authenticated layout shell.
 * Acts as the router parent for all protected routes.
 * The inner <router-outlet> renders chatbot/fintech/admin child routes.
 */
@Component({
  selector: 'app-shell',
  template: `
    <div class="app-shell">
      <app-sidebar></app-sidebar>
      <div class="main-area">
        <app-header></app-header>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; height: 100vh; overflow: hidden; }
    .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .main-content { flex: 1; overflow-y: auto; background: #f0f4f8; }
  `]
})
export class AppShellComponent {}
