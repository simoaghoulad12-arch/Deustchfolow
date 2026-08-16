import { UserRole } from './user-role';

/**
 * Identity claim carried by the short-lived service token from Next.js to
 * NestJS (see architecture decision record, section 4). Never trust a
 * role/id pair that did not come from verifying this token's signature.
 */
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}
