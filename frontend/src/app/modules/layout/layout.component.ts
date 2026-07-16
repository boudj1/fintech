import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
            MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-sidenav-container>
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>smart_toy</mat-icon>
          <span>AI Platform</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/customers" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Customers</span>
          </a>
          <a mat-list-item routerLink="/conversations" routerLinkActive="active">
            <mat-icon matListItemIcon>chat</mat-icon>
            <span matListItemTitle>Conversations</span>
          </a>
          <a mat-list-item routerLink="/knowledge-base" routerLinkActive="active">
            <mat-icon matListItemIcon>menu_book</mat-icon>
            <span matListItemTitle>Knowledge Base</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active">
            <mat-icon matListItemIcon>assessment</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
          <a mat-list-item routerLink="/audit" routerLinkActive="active">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>Audit Log</span>
          </a>
          <a mat-list-item routerLink="/settings" routerLinkActive="active">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span class="spacer"></span>
          <span>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</span>
          <button mat-icon-button (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        <div class="main-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

  `,
  styles: [`
    mat-sidenav-container { height: 100vh; }
    .sidenav { width: 240px; background: #1a237e; color: white; }
    .sidenav-header { display:flex; align-items:center; gap:8px; padding:20px 16px; font-size:18px; font-weight:500; border-bottom:1px solid rgba(255,255,255,0.1); }
    mat-nav-list a { color: rgba(255,255,255,0.8); }
    mat-nav-list a.active { color: white; background: rgba(255,255,255,0.15); border-radius:4px; }
    mat-nav-list a mat-icon { color: inherit; }
    .main-content { padding: 24px; overflow-y: auto; height: calc(100vh - 64px); }
    .spacer { flex: 1 1 auto; }
  `]
})
export class LayoutComponent {
  constructor(public authService: AuthService) {}
}
