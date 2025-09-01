// roles.guard_T1.003.ts
// Guard for role-based access control - Sprint 1 Task T1.003

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../generated/prisma';
import { ROLES_KEY } from '../decorators/roles.decorator_T1.003';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request (set by JWT strategy)
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!user.role) {
      throw new ForbiddenException('Usuário sem papel definido');
    }

    // Check if user has one of the required roles
    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado. Papéis necessários: ${requiredRoles.join(', ')}. Seu papel: ${user.role}`
      );
    }

    return true;
  }

  /**
   * Helper method to check role hierarchy
   * MASTER_ADMIN > ADMIN > OPERATOR > CLIENT
   */
  private getRoleLevel(role: Role): number {
    const roleLevels = {
      [Role.MASTER_ADMIN]: 4,
      [Role.ADMIN]: 3,
      [Role.OPERATOR]: 2,
      [Role.CLIENT]: 1,
    };
    return roleLevels[role] || 0;
  }

  /**
   * Check if user role is higher or equal to required role
   */
  canManageRole(userRole: Role, targetRole: Role): boolean {
    return this.getRoleLevel(userRole) >= this.getRoleLevel(targetRole);
  }
}
