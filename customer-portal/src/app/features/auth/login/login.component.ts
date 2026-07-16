import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-backdrop"></div>
      <div class="auth-card animate-up">
        <div class="auth-logo">
          <div class="brand-icon">F</div>
          <span>FinFlow</span>
        </div>
        <h2>Welcome back</h2>
        <p class="auth-sub">Sign in to your support portal</p>

        @if (error()) {
          <div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> {{ error() }}</div>
        }

        <form (ngSubmit)="submit()" #f="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-icon">
              <i class="fas fa-user"></i>
              <input id="username" class="form-control" type="text"
                placeholder="Enter your username"
                [(ngModel)]="creds.username" name="username" required>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-icon">
              <i class="fas fa-lock"></i>
              <input id="password" class="form-control" [type]="showPwd ? 'text' : 'password'"
                placeholder="Enter your password"
                [(ngModel)]="creds.password" name="password" required>
              <button type="button" class="eye-btn" (click)="showPwd=!showPwd">
                <i class="fas" [class.fa-eye]="!showPwd" [class.fa-eye-slash]="showPwd"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading()">
            @if (loading()) { <span class="spinner-sm"></span> Signing in… }
            @else { <i class="fas fa-sign-in-alt"></i> Sign In }
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/register">Create one</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #070a10 0%, #0c111b 50%, #121826 100%);
      position: relative; padding: 1rem;
    }
    .auth-backdrop {
      position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(ellipse at 30% 50%, rgba(25,205,187,.08) 0%, transparent 70%);
    }
    .auth-card {
      position: relative; width: min(420px, 100%);
      background: #121826; border: 1px solid rgba(255,255,255,.09);
      border-radius: 22px; padding: 2.5rem;
      box-shadow: 0 24px 70px rgba(0,0,0,.55);
    }
    .auth-logo {
      display: flex; align-items: center; gap: .6rem; margin-bottom: 2rem;
      font-family: 'Space Grotesk',sans-serif; font-weight: 700;
      font-size: 1.4rem; color: #e8edf5;
    }
    .brand-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #19cdbb, #0fb5a4);
      color: #04231f; font-weight: 800; font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
    }
    h2 { color: #e8edf5; font-size: 1.6rem; margin-bottom: .4rem; }
    .auth-sub { color: #8893a6; margin-bottom: 1.8rem; }
    .alert {
      padding: .75rem 1rem; border-radius: 10px; margin-bottom: 1.25rem;
      display: flex; align-items: center; gap: .6rem; font-size: .88rem;
    }
    .alert-error { background: rgba(239,68,68,.1); color: #f87171; border: 1px solid rgba(239,68,68,.2); }
    .form-group label { color: #c4cad6; }
    .input-icon {
      position: relative;
      i:first-child { position: absolute; left: .9rem; top: 50%; transform: translateY(-50%); color: #8893a6; }
    }
    .input-icon .form-control { padding-left: 2.6rem; background: #1b2433; border-color: rgba(255,255,255,.1); color: #e8edf5; }
    .input-icon .form-control:focus { border-color: #19cdbb; }
    .eye-btn {
      position: absolute; right: .8rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: #8893a6; transition: color .2s;
      &:hover { color: #19cdbb; }
    }
    .btn-primary { margin-top: .5rem; }
    .auth-footer { text-align: center; margin-top: 1.5rem; color: #8893a6; font-size: .88rem; }
    .auth-footer a { color: #19cdbb; font-weight: 600; }
    .spinner-sm {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
      animation: spin .7s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  creds = { username: '', password: '' };
  showPwd = false;
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.creds).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.status === 403 ? 'Invalid username or password.' : 'Login failed. Please try again.');
      }
    });
  }
}
