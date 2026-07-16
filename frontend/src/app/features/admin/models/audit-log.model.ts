export interface AuditLog {
  id: number;
  userId?: number;
  username?: string;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditStats {
  total: number;
  todayCount: number;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: CustomerStatus;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}
