import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="header">
      <div class="header-left">
        <span class="page-title">FinFlow</span>
      </div>
      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-details">
            <span class="user-name">
              {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
            </span>
            <span class="user-role">{{ authService.currentUser()?.role }}</span>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()">
          Déconnexion
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex; align-items: center; justify-content: space-between;
      height: 60px; padding: 0 24px;
      background: #fff; border-bottom: 1px solid #e8ecf0;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
    }
    .page-title { font-weight: 800; font-size: 18px; color: #0d1b3e; letter-spacing: -0.5px; }
    .header-right { display: flex; align-items: center; gap: 16px; }
    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #1d4ed8, #7c3aed);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700;
    }
    .user-details { display: flex; flex-direction: column; }
    .user-name { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .user-role {
      font-size: 10px; font-weight: 700; color: #2563eb;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .logout-btn {
      padding: 7px 18px; border-radius: 8px;
      border: 1.5px solid #e2e8f0; background: #fff;
      color: #64748b; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all .15s;
    }
    .logout-btn:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}

  get initials(): string {
    const u = this.authService.currentUser();
    if (!u) return '?';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || u.username?.[0]?.toUpperCase() ?? '?';
  }

  logout(): void {
    this.authService.logout();
  }
}
