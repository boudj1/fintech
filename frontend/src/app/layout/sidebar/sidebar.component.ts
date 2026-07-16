import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <nav class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">💸</span>
        <span class="brand-name">FinFlow</span>
      </div>

      <div class="nav-section-label">FINANCES</div>
      <ul class="nav-list">
        <li><a routerLink="/fintech/dashboard" routerLinkActive="active">🏠 Dashboard</a></li>
        <li><a routerLink="/fintech/accounts" routerLinkActive="active">🏦 Comptes</a></li>
        <li><a routerLink="/fintech/transactions" routerLinkActive="active">💸 Transactions</a></li>
        <li><a routerLink="/fintech/wallet" routerLinkActive="active">👜 Portefeuille</a></li>
        <li><a routerLink="/fintech/beneficiaries" routerLinkActive="active">👥 Bénéficiaires</a></li>
        <li><a routerLink="/fintech/products" routerLinkActive="active">📦 Produits</a></li>
      </ul>

      <div class="nav-section-label">SUPPORT</div>
      <ul class="nav-list">
        <li><a routerLink="/chatbot" routerLinkActive="active">🤖 Assistant FinFlow</a></li>
      </ul>

      <div class="nav-section-label" *ngIf="authService.hasRole('ADMIN','SUPER_ADMIN')">ADMINISTRATION</div>
      <ul class="nav-list" *ngIf="authService.hasRole('ADMIN','SUPER_ADMIN')">
        <li><a routerLink="/admin/analytics" routerLinkActive="active">📊 Analytics</a></li>
        <li><a routerLink="/admin/users" routerLinkActive="active">👤 Utilisateurs</a></li>
        <li><a routerLink="/admin/products" routerLinkActive="active">🛒 Produits Admin</a></li>
        <li><a routerLink="/admin/logs" routerLinkActive="active">📋 Audit Logs</a></li>
        <li><a routerLink="/admin/settings" routerLinkActive="active">⚙️ Paramètres</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .sidebar { width:240px; height:100vh; background:#0d1b3e; color:white; display:flex; flex-direction:column; overflow-y:auto; }
    .sidebar-brand { display:flex; align-items:center; gap:10px; padding:20px 16px; font-size:20px; font-weight:700; border-bottom:1px solid rgba(255,255,255,.1); background:linear-gradient(135deg,#1a3a8c,#0d1b3e); }
    .brand-icon { font-size:26px; }
    .nav-section-label { font-size:10px; font-weight:700; letter-spacing:1.5px; color:rgba(255,255,255,.4); padding:16px 20px 4px; text-transform:uppercase; }
    .nav-list { list-style:none; padding:4px 0; margin:0; }
    .nav-list li a { display:block; padding:10px 20px; color:rgba(255,255,255,.75); text-decoration:none; font-size:13.5px; transition:all .15s; border-radius:0; }
    .nav-list li a:hover { background:rgba(255,255,255,.1); color:white; }
    .nav-list li a.active { background:rgba(82,130,255,.35); color:#7eb8ff; border-left:3px solid #4a8fff; }
  `]
})
export class SidebarComponent {
  constructor(public authService: AuthService) {}
}
