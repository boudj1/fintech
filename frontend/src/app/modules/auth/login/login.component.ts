import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">💸</div>
          <h1>FinFlow</h1>
          <p>Votre banque numérique intelligente</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Identifiant</label>
            <input formControlName="username" type="text"
                   placeholder="Entrez votre identifiant"
                   autocomplete="username" />
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <div class="pwd-wrapper">
              <input formControlName="password" [type]="showPwd ? 'text' : 'password'"
                     placeholder="Entrez votre mot de passe"
                     autocomplete="current-password" />
              <button type="button" class="toggle-pwd" (click)="showPwd = !showPwd">
                {{ showPwd ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="error-msg" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || loading">
            <span *ngIf="!loading">Se connecter</span>
            <span *ngIf="loading">Connexion en cours...</span>
          </button>
        </form>

        <div class="login-footer">
          <p>Compte de démo&nbsp;: <code>admin</code> / <code>admin</code></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0d1b3e 0%, #1a3a8c 60%, #2563eb 100%);
    }
    .login-card {
      background: #fff; padding: 40px 44px; border-radius: 16px;
      width: 400px; box-shadow: 0 24px 60px rgba(0,0,0,.35);
    }
    .login-header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 52px; }
    h1 { font-size: 26px; font-weight: 800; color: #0d1b3e; margin: 8px 0 0; letter-spacing: -1px; }
    .login-header p { color: #666; font-size: 13px; margin: 6px 0 0; }
    .form-group { margin-bottom: 18px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
    input {
      width: 100%; padding: 11px 14px; border: 1.5px solid #dde1e9;
      border-radius: 8px; font-size: 14px; box-sizing: border-box;
      transition: border-color .2s, box-shadow .2s;
    }
    input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
    .pwd-wrapper { position: relative; }
    .pwd-wrapper input { padding-right: 44px; }
    .toggle-pwd {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 16px; padding: 0;
    }
    .submit-btn {
      width: 100%; padding: 13px; background: #1d4ed8; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 700;
      cursor: pointer; margin-top: 8px; transition: background .2s;
    }
    .submit-btn:hover:not(:disabled) { background: #1e40af; }
    .submit-btn:disabled { background: #93c5fd; cursor: not-allowed; }
    .error-msg {
      color: #dc2626; font-size: 13px; margin-bottom: 14px;
      padding: 10px 14px; background: #fef2f2; border-radius: 8px;
      border: 1px solid #fecaca;
    }
    .login-footer { text-align: center; margin-top: 24px; color: #999; font-size: 12px; }
    .login-footer code { background: #f0f0f0; padding: 1px 6px; border-radius: 4px; }
  `]
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  showPwd = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;
    this.authService.login(username!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Identifiant ou mot de passe incorrect.';
      }
    });
  }
}
