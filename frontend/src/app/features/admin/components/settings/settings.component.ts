import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  template: `
    <div class="content-wrapper">
      <h1>Settings</h1>
      <div class="settings-section">
        <h3>Account</h3>
        <div class="info-row"><span>Username:</span><strong>{{ user?.username }}</strong></div>
        <div class="info-row"><span>Email:</span><strong>{{ user?.email }}</strong></div>
        <div class="info-row"><span>Role:</span><strong>{{ user?.role }}</strong></div>
      </div>
    </div>
  `,
  styles: [`
    .settings-section { background:white; padding:24px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,.1); max-width:500px; }
    h3 { margin-top:0; color:#1565c0; }
    .info-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f0f0f0; }
    .info-row span { color:#666; }
  `]
})
export class SettingsComponent {
  constructor(public authService: AuthService) {}

  get user() { return this.authService.currentUser(); }
}
