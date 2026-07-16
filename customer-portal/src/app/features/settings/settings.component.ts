import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-up">
      <h2>Settings</h2>

      <div class="settings-grid">
        <!-- Appearance -->
        <div class="card">
          <div class="card-header"><h3><i class="fas fa-palette"></i> Appearance</h3></div>
          <div class="setting-row">
            <div>
              <div class="setting-label">Dark Mode</div>
              <div class="setting-desc">Switch between light and dark theme</div>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="darkMode" (change)="onThemeChange()">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-row">
            <div>
              <div class="setting-label">Accent Color</div>
              <div class="setting-desc">Primary color for buttons and highlights</div>
            </div>
            <div class="color-dots">
              @for (c of colors; track c.value) {
                <button class="color-dot" [style.background]="c.value" [class.active]="accent === c.value" (click)="setAccent(c.value)" [title]="c.name"></button>
              }
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="card">
          <div class="card-header"><h3><i class="fas fa-bell"></i> Notifications</h3></div>
          <div class="setting-row">
            <div>
              <div class="setting-label">Case Updates</div>
              <div class="setting-desc">Receive notifications when your case status changes</div>
            </div>
            <label class="toggle"><input type="checkbox" [checked]="true"><span class="slider"></span></label>
          </div>
          <div class="setting-row">
            <div>
              <div class="setting-label">Agent Messages</div>
              <div class="setting-desc">Alert when an agent sends you a reply</div>
            </div>
            <label class="toggle"><input type="checkbox" [checked]="true"><span class="slider"></span></label>
          </div>
          <div class="setting-row">
            <div>
              <div class="setting-label">Resolved Cases</div>
              <div class="setting-desc">Notify when your case is marked resolved</div>
            </div>
            <label class="toggle"><input type="checkbox" [checked]="true"><span class="slider"></span></label>
          </div>
        </div>

        <!-- Language -->
        <div class="card">
          <div class="card-header"><h3><i class="fas fa-globe"></i> Language & Region</h3></div>
          <div class="form-group">
            <label>Interface Language</label>
            <select class="form-control" [(ngModel)]="language">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date Format</label>
            <select class="form-control" [(ngModel)]="dateFormat">
              <option value="MMM d, y">Jan 1, 2024</option>
              <option value="dd/MM/yyyy">01/01/2024</option>
              <option value="MM/dd/yyyy">01/01/2024 (US)</option>
            </select>
          </div>
          <button class="btn btn-primary btn-sm" (click)="savePrefs()">
            <i class="fas fa-save"></i> Save Preferences
          </button>
        </div>

        <!-- About -->
        <div class="card">
          <div class="card-header"><h3><i class="fas fa-info-circle"></i> About</h3></div>
          <div class="about-info">
            <div class="about-logo">
              <div class="brand-icon">F</div>
              <div>
                <strong>FinFlow Enterprise Portal</strong>
                <span>v1.0.0</span>
              </div>
            </div>
            <p>A production-ready customer support portal powered by AI. Built with Angular 17 and connected to Enterprise AI Platform.</p>
            <div class="about-links">
              <a href="#" class="btn btn-secondary btn-sm">Privacy Policy</a>
              <a href="#" class="btn btn-secondary btn-sm">Terms of Service</a>
            </div>
          </div>
          <div class="danger-zone">
            <h4>Danger Zone</h4>
            <button class="btn btn-danger btn-sm" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i> Sign Out of All Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    h2 { margin-bottom: 0; }
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; align-items: start; }
    .card-header h3 { display: flex; align-items: center; gap: .55rem; i{color:var(--primary);font-size:.95rem;} }

    .setting-row { display: flex; justify-content: space-between; align-items: center; padding: .9rem 0; border-bottom: 1px solid var(--border); gap: 1rem;
      &:last-child { border-bottom: none; }
    }
    .setting-label { font-weight: 500; font-size: .9rem; margin-bottom: .2rem; }
    .setting-desc { font-size: .8rem; color: var(--text-muted); }

    .toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; inset: 0; background: var(--border); border-radius: 24px; cursor: pointer; transition: .3s; &::before{content:'';position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s;} }
    .toggle input:checked + .slider { background: var(--primary); }
    .toggle input:checked + .slider::before { transform: translateX(20px); }

    .color-dots { display: flex; gap: .5rem; }
    .color-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform .2s; &.active{border-color:#fff;transform:scale(1.15);box-shadow:0 0 0 2px var(--primary);} &:hover{transform:scale(1.1);} }

    .about-info { margin-bottom: 1.5rem; }
    .about-logo { display: flex; align-items: center; gap: .75rem; margin-bottom: .9rem; strong{display:block;font-family:'Space Grotesk',sans-serif;} span{font-size:.8rem;color:var(--text-muted);} }
    .brand-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,var(--primary),var(--primary-dark)); color:#04231f; font-weight:800; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
    .about-info p { font-size: .85rem; margin-bottom: 1rem; }
    .about-links { display: flex; gap: .6rem; }

    .danger-zone { padding-top: 1.25rem; border-top: 1px solid var(--border); h4{color:var(--danger);margin-bottom:.75rem;font-size:.95rem;} }
  `]
})
export class SettingsComponent implements OnInit {
  darkMode = false;
  language = 'en';
  dateFormat = 'MMM d, y';
  accent = '#19cdbb';

  colors = [
    { name: 'Teal',   value: '#19cdbb' },
    { name: 'Blue',   value: '#3b82f6' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Green',  value: '#22c55e' },
  ];

  constructor(private toast: ToastService, private auth: AuthService) {}

  ngOnInit(): void {
    this.darkMode = document.body.classList.contains('dark');
  }

  onThemeChange(): void {
    document.body.classList.toggle('dark', this.darkMode);
    localStorage.setItem('ff-theme', this.darkMode ? 'dark' : 'light');
  }

  setAccent(c: string): void { this.accent = c; }
  savePrefs(): void { this.toast.success('Preferences saved', 'Your settings have been updated.'); }
  logout(): void { this.auth.logout(); }
}
