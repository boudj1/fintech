import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-users-management',
  template: `
    <div class="content-wrapper">
      <h1>User Management</h1>
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th><th>Username</th><th>Email</th><th>Name</th><th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td><span class="badge">{{ user.role }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th, .data-table td { padding:12px; text-align:left; border-bottom:1px solid #e0e0e0; }
    .badge { background:#e3f2fd; color:#1565c0; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:600; }
  `]
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getUsers().subscribe(res => this.users = res.content);
  }
}
