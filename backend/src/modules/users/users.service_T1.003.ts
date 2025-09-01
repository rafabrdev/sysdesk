// users.service_T1.003.ts
// Service for user management with invite-based registration - Sprint 1 Task T1.003

import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvitesService } from '../invites/invites.service_T1.003';
import { AuthService } from '../auth/auth.service_T1.002';
import { RegisterByInviteDto, RegisterResponseDto } from './dto/register-by-invite.dto_T1.003';
import { User, AuditAction } from '../../../generated/prisma';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private invitesService: InvitesService,
    private authService: AuthService,
  ) {}

  async registerByInvite(dto: RegisterByInviteDto): Promise<RegisterResponseDto> {
    // Validate invite token
    const invite = await this.invitesService.findByToken(dto.token);
    
    if (!invite) {
      throw new NotFoundException('Convite inválido');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      throw new ConflictException('Usuário já existe com este email');
    }

    // Use transaction to create user and update invite
    const result = await this.prisma.$transaction(async (tx) => {
      // Hash password
      const hashedPassword = await this.authService.hashPassword(dto.password);

      // Create user
      const user = await tx.user.create({
        data: {
          email: invite.email,
          password: hashedPassword,
          name: dto.name || invite.name || invite.email,
          phone: dto.phone,
          role: invite.role,
          department: invite.department,
          position: dto.position,
          companyId: invite.companyId,
          isActive: true,
          isEmailVerified: false, // Will need email verification in future
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Update invite usage
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          uses: { increment: 1 },
          usedAt: invite.uses === 0 ? new Date() : undefined,
          usedById: invite.maxUses === 1 ? user.id : undefined,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.CREATE,
          entityType: 'User',
          entityId: user.id,
          userId: user.id,
          companyId: user.companyId,
          metadata: {
            registeredByInvite: true,
            inviteToken: dto.token,
            invitedBy: invite.invitedById,
          },
        },
      });

      return user;
    });

    this.logger.log(`User ${result.email} registered via invite token ${dto.token}`);

    return {
      success: true,
      message: 'Usuário registrado com sucesso',
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        companyId: result.companyId,
        company: (result as any).company,
      },
    };
  }

  async findAll(companyId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { 
        companyId,
        deletedAt: null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { 
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, updateData: any, companyId: string, updatedById: string): Promise<User> {
    const user = await this.findOne(id, companyId);

    // Store old data for audit
    const oldData = { ...user };

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: id,
        userId: updatedById,
        companyId,
        oldData,
        newData: updated,
        metadata: { updatedFields: Object.keys(updateData) },
      },
    });

    return updated;
  }

  async deactivate(id: string, companyId: string, deactivatedById: string): Promise<void> {
    await this.update(
      id,
      { 
        isActive: false,
        deletedAt: new Date(),
      },
      companyId,
      deactivatedById,
    );

    // Invalidate all user sessions
    await this.prisma.session.updateMany({
      where: { userId: id },
      data: {
        isValid: false,
        revokedAt: new Date(),
        revokedReason: 'User deactivated',
      },
    });

    this.logger.log(`User ${id} deactivated by ${deactivatedById}`);
  }
}
