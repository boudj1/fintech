import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
        <h2>Create account</h2>
        <p class="auth-sub">Join the enterprise support portal</p>

        @if (error()) {
          <div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> {{ error() }}</div>
        }

        <form (ngSubmit)="submit()">
          <div class="row-2">
            <div class="form-group">
              <label>First Name</label>
              <input class="form-control" type="text" [(ngModel)]="form.firstName" name="fn" placeholder="John" required>
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input class="form-control" type="text" [(ngModel)]="form.lastName" name="ln" placeholder="Doe" required>
            </div>
          </div>

          <div class="form-group">
            <label>Username</label>
            <div class="input-icon">
              <i class="fas fa-user"></i>
              <input class="form-control" type="text" [(ngModel)]="form.username" name="u" placeholder="johndoe" required>
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <div class="input-icon">
              <i class="fas fa-envelope"></i>
              <input class="form-control" type="email" [(ngModel)]="form.email" name="e" placeholder="john@example.com" required>
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-icon">
              <i class="fas fa-lock"></i>
              <input class="form-control" [type]="showPwd ? 'text' : 'password'" [(ngModel)]="form.password" name="p" placeholder="Min. 8 characters" required minlength="8">
              <button type="button" class="eye-btn" (click)="showPwd=!showPwd">
                <i class="fas" [class.fa-eye]="!showPwd" [class.fa-eye-slash]="showPwd"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading()">
            @if (loading()) { <span class="spinner-sm"></span> Creating account… }
            @else { <i class="fas fa-user-plus"></i> Create Account }
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
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
      background: radial-gradient(ellipse at 70% 30%, rgba(25,205,187,.08) 0%, transparent 70%);
    }
    .auth-card {
      position: relative; width: min(440px, 100%);
      background: #121826; border: 1px solid rgba(255,255,255,.09);
      border-radius: 22px; padding: 2.5rem;
      box-shadow: 0 24px 70px rgba(0,0,0,.55);
    }
    .auth-logo {
      display: flex; align-items: center; gap: .6rem; margin-bottom: 2rem;
      font-family: 'Space Grotesk',sans-serif; font-weight: 700; font-size: 1.4rem; color: #e8edf5;
    }
    .brand-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #19cdbb, #0fb5a4);
      color: #04231f; font-weight: 800; font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
    }
    h2 { color: #e8edf5; font-size: 1.6rem; margin-bottom: .4rem; }
    .auth-sub { color: #8893a6; margin-bottom: 1.8rem; }
    .alert { padding: .75rem 1rem; border-radius: 10px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: .6rem; font-size: .88rem; }
    .alert-error { background: rgba(239,68,68,.1); color: #f87171; border: 1px solid rgba(239,68,68,.2); }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group label { color: #c4cad6; }
    .form-control { background: #1b2433; border-color: rgba(255,255,255,.1); color: #e8edf5; }
    .form-control:focus { border-color: #19cdbb; }
    .input-icon { position: relative; i:first-child { position: absolute; left: .9rem; top: 50%; transform: translateY(-50%); color: #8893a6; } }
    .input-icon .form-control { padding-left: 2.6rem; }
    .eye-btn { position: absolute; right: .8rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #8893a6; &:hover{color:#19cdbb;} }
    .auth-footer { text-align: center; margin-top: 1.5rem; color: #8893a6; font-size: .88rem; }
    .auth-footer a { color: #19cdbb; font-weight: 600; }
    .spinner-sm { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; animation: spin .7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  form = { firstName: '', lastName: '', username: '', email: '', password: '' };
  showPwd = false;
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.register(this.form).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.loading.set(false);
        const msg = e.error?.message || 'Registration failed. Please try again.';
        this.error.set(msg);
      }
    });
  }
}
