import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="content-wrapper">
      <h1>Settings</h1>
      <mat-card>
        <mat-card-header><mat-card-title>Profile</mat-card-title></mat-card-header>
        <mat-card-content>
          <p><strong>Username:</strong> {{user?.username}}</p>
          <p><strong>Email:</strong> {{user?.email}}</p>
          <p><strong>Role:</strong> {{user?.role}}</p>
          <p><strong>Name:</strong> {{user?.firstName}} {{user?.lastName}}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: ['mat-card { max-width:600px; margin-top:24px; } p { margin:12px 0; }']
})
export class SettingsComponent {
  user: User | null;
  constructor(public authService: AuthService) { this.user = authService.currentUser(); }
}
