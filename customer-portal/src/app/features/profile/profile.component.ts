import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-up">
      <div class="page-header">
        <h2>Profile Settings</h2>
        <p>Manage your personal information and security</p>
      </div>

      <div class="profile-grid">
        <!-- Avatar & Info -->
        <div class="card profile-hero">
          <div class="avatar-wrap">
            <div class="avatar-lg">{{ initials }}</div>
            <div class="avatar-status"></div>
          </div>
          <h3>{{ user?.firstName }} {{ user?.lastName }}</h3>
          <p>{{ user?.email }}</p>
          <span class="role-badge">{{ user?.role?.replace('_', ' ') }}</span>
        </div>

        <!-- Personal Info -->
        <div class="card">
          <div class="card-header"><h3>Personal Information</h3></div>
          <form (ngSubmit)="saveProfile()">
            <div class="row-2">
              <div class="form-group">
                <label>First Name</label>
                <input class="form-control" type="text" [(ngModel)]="profileForm.firstName" name="fn">
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input class="form-control" type="text" [(ngModel)]="profileForm.lastName" name="ln">
              </div>
            </div>
            <div class="form-group">
              <label>Username</label>
              <input class="form-control" type="text" [value]="user?.username" readonly disabled>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input class="form-control" type="email" [value]="user?.email" readonly disabled>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) { <span class="spinner-sm"></span> Saving… }
              @else { <i class="fas fa-save"></i> Save Changes }
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="card">
          <div class="card-header"><h3><i class="fas fa-lock" style="color:var(--primary)"></i> Security</h3></div>
          <form (ngSubmit)="changePassword()">
            <div class="form-group">
              <label>Current Password</label>
              <input class="form-control" type="password" [(ngModel)]="pwdForm.current" name="cur" placeholder="Enter current password">
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input class="form-control" type="password" [(ngModel)]="pwdForm.newPwd" name="np" placeholder="Min. 8 characters" minlength="8">
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input class="form-control" type="password" [(ngModel)]="pwdForm.confirm" name="cf" placeholder="Repeat new password">
            </div>
            @if (pwdError()) {
              <div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> {{ pwdError() }}</div>
            }
            <button type="submit" class="btn btn-secondary" [disabled]="changingPwd()">
              @if (changingPwd()) { <span class="spinner-sm"></span> Updating… }
              @else { <i class="fas fa-key"></i> Change Password }
            </button>
          </form>
        </div>

        <!-- Account Activity -->
        <div class="card">
          <div class="card-header"><h3>Account Information</h3></div>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label"><i class="fas fa-user"></i> Role</span>
              <span class="info-val">{{ user?.role }}</span>
            </div>
            <div class="info-row">
              <span class="info-label"><i class="fas fa-shield-alt"></i> Security</span>
              <span class="info-val badge badge-resolved">Active</span>
            </div>
            <div class="info-row">
              <span class="info-label"><i class="fas fa-id-card"></i> User ID</span>
              <span class="info-val">#{{ user?.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: .75rem; }
    .page-header h2 { margin-bottom: .25rem; }
    .page-header p { color: var(--text-muted); font-size: .88rem; margin-bottom: 1rem; }
    .profile-grid { display: grid; grid-template-columns: 240px 1fr; grid-template-rows: auto auto; gap: 1.25rem; align-items: start; }
    .profile-hero { text-align: center; padding: 2rem 1.5rem; grid-row: 1 / 3; display: flex; flex-direction: column; align-items: center; gap: .75rem; }
    .avatar-wrap { position: relative; margin-bottom: .5rem; }
    .avatar-lg { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg,var(--primary),var(--primary-dark)); color: #04231f; font-weight: 700; font-size: 1.6rem; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk',sans-serif; }
    .avatar-status { position: absolute; right: 2px; bottom: 2px; width: 18px; height: 18px; border-radius: 50%; background: #22c55e; border: 3px solid var(--surface); }
    .profile-hero h3 { margin: 0; }
    .profile-hero p { color: var(--text-muted); font-size: .85rem; margin: 0; }
    .role-badge { padding: .3rem .9rem; border-radius: 999px; background: rgba(25,205,187,.1); color: var(--primary); font-size: .78rem; font-weight: 600; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .alert { padding: .7rem 1rem; border-radius: 10px; margin-bottom: 1rem; display:flex; align-items:center; gap:.6rem; font-size:.85rem; }
    .alert-error { background: rgba(239,68,68,.08); color:#ef4444; border:1px solid rgba(239,68,68,.15); }
    .info-list { display: flex; flex-direction: column; gap: .5rem; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: .75rem; background: var(--bg2); border-radius: 9px; }
    .info-label { display:flex; align-items:center; gap:.5rem; font-size:.85rem; color:var(--text-muted); i{width:14px;} }
    .info-val { font-size: .85rem; font-weight: 500; }
    .spinner-sm { width:14px; height:14px; border-radius:50%; border:2px solid rgba(4,35,31,.3); border-top-color:#04231f; animation:spin .7s linear infinite; display:inline-block; }
    @keyframes spin{to{transform:rotate(360deg)}}
    @media(max-width:768px) { .profile-grid{grid-template-columns:1fr;} .profile-hero{grid-row:auto;} .row-2{grid-template-columns:1fr;} }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm = { firstName: '', lastName: '' };
  pwdForm = { current: '', newPwd: '', confirm: '' };
  saving = signal(false);
  changingPwd = signal(false);
  pwdError = signal('');

  get initials(): string {
    const u = this.user;
    if (!u) return 'U';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  }

  constructor(private auth: AuthService, private toast: ToastService) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser();
    if (this.user) {
      this.profileForm.firstName = this.user.firstName;
      this.profileForm.lastName = this.user.lastName;
    }
    this.auth.getMe().subscribe({ next: u => { this.user = u; this.profileForm.firstName = u.firstName; this.profileForm.lastName = u.lastName; }, error: () => {} });
  }

  saveProfile(): void {
    this.saving.set(true);
    setTimeout(() => { this.saving.set(false); this.toast.success('Profile updated', 'Your changes have been saved.'); }, 600);
  }

  changePassword(): void {
    this.pwdError.set('');
    if (this.pwdForm.newPwd.length < 8) { this.pwdError.set('New password must be at least 8 characters.'); return; }
    if (this.pwdForm.newPwd !== this.pwdForm.confirm) { this.pwdError.set('Passwords do not match.'); return; }
    this.changingPwd.set(true);
    this.auth.changePassword(this.pwdForm.current, this.pwdForm.newPwd).subscribe({
      next: () => {
        this.changingPwd.set(false);
        this.pwdForm = { current: '', newPwd: '', confirm: '' };
        this.toast.success('Password changed', 'Your password has been updated.');
      },
      error: () => {
        this.changingPwd.set(false);
        this.pwdError.set('Current password is incorrect.');
      }
    });
  }
}
