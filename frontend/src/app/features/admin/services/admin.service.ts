import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PageResponse } from '../../../core/services/api.service';
import { AuditLog, AuditStats, Customer, CustomerStats } from '../models/audit-log.model';
import { User } from '../../../core/models/user.model';

@Injectable()
export class AdminService {
  private readonly customersPath = '/v1/admin/customers';
  private readonly usersPath = '/v1/admin/users';
  private readonly analyticsPath = '/v1/admin/analytics';

  constructor(private api: ApiService) {}

  // Customers
  getCustomers(page = 0, size = 20, query?: string): Observable<PageResponse<Customer>> {
    return this.api.get<PageResponse<Customer>>(this.customersPath, { page, size, query });
  }

  getCustomerStats(): Observable<CustomerStats> {
    return this.api.get<CustomerStats>(`${this.customersPath}/stats`);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.api.delete<void>(`${this.customersPath}/${id}`);
  }

  // Users
  getUsers(page = 0, size = 20): Observable<PageResponse<User>> {
    return this.api.get<PageResponse<User>>(this.usersPath, { page, size });
  }

  updateUserRole(userId: number, role: string): Observable<User> {
    return this.api.put<User>(`${this.usersPath}/${userId}/role?role=${role}`, {});
  }

  // Analytics / Audit Logs
  getAuditLogs(page = 0, size = 50): Observable<PageResponse<AuditLog>> {
    return this.api.get<PageResponse<AuditLog>>(`${this.analyticsPath}/logs`, { page, size });
  }

  getAuditStats(): Observable<AuditStats> {
    return this.api.get<AuditStats>(`${this.analyticsPath}/logs/stats`);
  }
}
