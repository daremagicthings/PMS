import { AsyncLocalStorage } from 'async_hooks';
import { Role } from '@prisma/client';

export interface TenantContextData {
  userId: string;
  role: Role;
  organizationId: string | null;
}

export const tenantContext = new AsyncLocalStorage<TenantContextData>();
