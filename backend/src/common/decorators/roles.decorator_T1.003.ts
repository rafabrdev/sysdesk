// roles.decorator_T1.003.ts
// Decorator for role-based access control - Sprint 1 Task T1.003

import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for accessing a route
 * @param roles - Array of roles that are allowed to access the route
 * 
 * @example
 * @Roles(Role.ADMIN, Role.MASTER_ADMIN)
 * @Get('admin-only')
 * adminRoute() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Helper decorator for common role combinations
 */
export const AdminOnly = () => Roles(Role.ADMIN, Role.MASTER_ADMIN);
export const OperatorOnly = () => Roles(Role.OPERATOR, Role.ADMIN, Role.MASTER_ADMIN);
export const MasterAdminOnly = () => Roles(Role.MASTER_ADMIN);
