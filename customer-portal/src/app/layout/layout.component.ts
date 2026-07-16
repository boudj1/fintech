import { Component, OnInit, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { ChatWidgetComponent } from '../shared/chat-widget/chat-widget.component';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ChatWidgetComponent],
  template: `
    <!-- ── Navbar ── -->
    <nav class="navbar">
      <div class="nav-brand" routerLink="/dashboard">
        <div class="brand-icon">F</div>
        <span>FinFlow</span>
      </div>

      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
          <i class="fas fa-home"></i><span>Dashboard</span>
        </a>
        <a routerLink="/new-request" routerLinkActive="active">
          <i class="fas fa-paper-plane"></i><span>New Request</span>
        </a>
        <a routerLink="/conversations" routerLinkActive="active">
          <i class="fas fa-history"></i><span>My Cases</span>
        </a>
        <a routerLink="/notifications" routerLinkActive="active">
          <i class="fas fa-bell"></i><span>Notifications</span>
        </a>
      </div>

      <div class="nav-end">
        <button class="theme-btn" (click)="toggleTheme()" [title]="dark()? 'Light mode' : 'Dark mode'">
          <i class="fas" [class.fa-sun]="dark()" [class.fa-moon]="!dark()"></i>
        </button>

        <div class="user-menu" (click)="menuOpen = !menuOpen">
          <div class="user-avatar">{{ initials }}</div>
          <span class="user-name">{{ auth.currentUser()?.firstName }}</span>
          <i class="fas fa-chevron-down" style="font-size:.75rem"></i>

          @if (menuOpen) {
            <div class="dropdown" (click)="$event.stopPropagation()">
              <a routerLink="/profile" (click)="menuOpen=false">
                <i class="fas fa-user"></i> Profile
              </a>
              <a routerLink="/settings" (click)="menuOpen=false">
                <i class="fas fa-cog"></i> Settings
              </a>
              <hr>
              <button (click)="logout()">
                <i class="fas fa-sign-out-alt"></i> Sign Out
              </button>
            </div>
          }
        </div>
      </div>
    </nav>

    <!-- ── Content ── -->
    <main class="main-content">
      <router-outlet />
    </main>

    <!-- ── AI Chat Widget ── -->
    <app-chat-widget />
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; gap: 2rem;
      padding: .75rem 2rem;
      background: var(--surface); border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow);
    }
    .nav-brand {
      display: flex; align-items: center; gap: .6rem;
      font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.3rem;
      color: var(--text); cursor: pointer; flex-shrink: 0;
      text-decoration: none;
    }
    .brand-icon {
      width: 32px; height: 32px; border-radius: 9px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #04231f; font-weight: 800; font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
    }
    .nav-links {
      display: flex; align-items: center; gap: .25rem; flex: 1; justify-content: center;
    }
    .nav-links a {
      display: flex; align-items: center; gap: .5rem;
      padding: .5rem .9rem; border-radius: 9px;
      font-weight: 500; font-size: .9rem; color: var(--text-muted);
      text-decoration: none; transition: var(--transition);
    }
    .nav-links a:hover { color: var(--primary); background: rgba(25,205,187,.07); }
    .nav-links a.active { color: var(--primary); background: rgba(25,205,187,.1); font-weight: 600; }
    .nav-end { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
    .theme-btn {
      width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--border);
      background: var(--bg2); color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition);
      &:hover { color: var(--primary); border-color: var(--primary); }
    }
    .user-menu {
      position: relative; display: flex; align-items: center; gap: .6rem;
      padding: .45rem .9rem; border-radius: 10px; cursor: pointer;
      background: var(--bg2); border: 1px solid var(--border);
      color: var(--text); transition: var(--transition);
      &:hover { border-color: var(--primary); }
    }
    .user-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #04231f; font-weight: 700; font-size: .75rem;
      display: flex; align-items: center; justify-content: center;
    }
    .user-name { font-weight: 600; font-size: .88rem; }
    .dropdown {
      position: absolute; top: calc(100% + 8px); right: 0; min-width: 180px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,.15);
      padding: .5rem; z-index: 200; animation: slideUp .2s ease;
      a, button {
        display: flex; align-items: center; gap: .65rem;
        padding: .6rem .9rem; border-radius: 8px; width: 100%;
        font-size: .88rem; font-weight: 500; color: var(--text);
        text-decoration: none; background: none; border: none; cursor: pointer;
        transition: var(--transition);
        i { width: 16px; color: var(--text-muted); }
        &:hover { background: rgba(25,205,187,.08); color: var(--primary); i{color:var(--primary);} }
      }
      hr { border: none; border-top: 1px solid var(--border); margin: .35rem 0; }
      button { color: var(--danger); &:hover{background:rgba(239,68,68,.08);color:var(--danger);} }
    }
    .main-content {
      padding: 2rem; max-width: 1280px; margin: 0 auto; width: 100%;
    }
    @media(max-width:768px) {
      .navbar { padding: .6rem 1rem; gap: 1rem; }
      .nav-links span { display: none; }
      .user-name { display: none; }
      .main-content { padding: 1rem; }
    }
  `]
})
export class LayoutComponent implements OnInit {
  dark = signal(false);
  menuOpen = false;

  get initials(): string {
    const u = this.auth.currentUser();
    if (!u) return 'U';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || u.username[0].toUpperCase();
  }

  constructor(public auth: AuthService, public toast: ToastService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('ff-theme');
    if (saved === 'dark') { this.dark.set(true); document.body.classList.add('dark'); }
  }

  toggleTheme(): void {
    this.dark.update(d => !d);
    document.body.classList.toggle('dark', this.dark());
    localStorage.setItem('ff-theme', this.dark() ? 'dark' : 'light');
  }

  logout(): void { this.menuOpen = false; this.auth.logout(); }

  @HostListener('document:click')
  onDocClick(): void { if (this.menuOpen) this.menuOpen = false; }
}
