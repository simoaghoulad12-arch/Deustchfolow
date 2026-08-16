import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@deutschflow/types';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles. Checked server-side by RolesGuard — never trust a client-sent role. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
