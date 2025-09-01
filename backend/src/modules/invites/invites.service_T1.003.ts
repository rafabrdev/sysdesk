// invites.service_T1.003.ts
// Service for managing invites - Sprint 1 Task T1.003

import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInviteDto, InviteResponseDto } from './dto/create-invite.dto_T1.003';
import { Role, AuditAction } from '../../../generated/prisma';

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);
  private readonly defaultExpirationDays = 7;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createInviteDto: CreateInviteDto, userId: string, companyId: string): Promise<InviteResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Check role hierarchy - user can only invite with equal or lower role
    if (!this.canInviteRole(user.role, createInviteDto.role)) {
      throw new ForbiddenException(
        `Você não tem permissão para convidar usuários com papel ${createInviteDto.role}`
      );
    }

    // Check if email already exists in the company
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createInviteDto.email,
        companyId,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Já existe um usuário com este email nesta empresa');
    }

    // Check for active invites with same email
    const activeInvite = await this.prisma.invite.findFirst({
      where: {
        email: createInviteDto.email,
        companyId,
        expiresAt: { gt: new Date() },
        uses: { lt: this.prisma.invite.fields.maxUses },
      },
    });

    if (activeInvite) {
      throw new BadRequestException('Já existe um convite ativo para este email');
    }

    // Set expiration date
    const expiresAt = createInviteDto.expiresAt 
      ? new Date(createInviteDto.expiresAt)
      : new Date(Date.now() + this.defaultExpirationDays * 24 * 60 * 60 * 1000);

    // Create invite
    const invite = await this.prisma.invite.create({
      data: {
        email: createInviteDto.email,
        name: createInviteDto.name,
        role: createInviteDto.role,
        department: createInviteDto.department,
        message: createInviteDto.message,
        maxUses: createInviteDto.maxUses || 1,
        expiresAt,
        companyId,
        invitedById: userId,
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    // Log audit
    await this.logAudit(
      AuditAction.INVITE_USER,
      'Invite',
      invite.id,
      userId,
      companyId,
      {
        email: invite.email,
        role: invite.role,
        maxUses: invite.maxUses,
      },
    );

    this.logger.log(`Invite created for ${invite.email} by user ${userId}`);

    return this.formatInviteResponse(invite);
  }

  async findAll(companyId: string, userId: string): Promise<InviteResponseDto[]> {
    const invites = await this.prisma.invite.findMany({
      where: { companyId },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        usedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invites.map(invite => this.formatInviteResponse(invite));
  }

  async findByToken(token: string): Promise<InviteResponseDto> {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
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

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    // Check if expired
    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Convite expirado');
    }

    // Check if fully used
    if (invite.uses >= invite.maxUses) {
      throw new BadRequestException('Convite já foi utilizado');
    }

    return this.formatInviteResponse(invite);
  }

  async validateToken(token: string): Promise<{ valid: boolean; invite?: InviteResponseDto; error?: string }> {
    try {
      const invite = await this.findByToken(token);
      return { valid: true, invite };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message || 'Token inválido' 
      };
    }
  }

  async useInvite(token: string, userId: string): Promise<void> {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Convite expirado');
    }

    if (invite.uses >= invite.maxUses) {
      throw new BadRequestException('Convite já foi totalmente utilizado');
    }

    // Update invite usage
    await this.prisma.invite.update({
      where: { id: invite.id },
      data: {
        uses: { increment: 1 },
        usedAt: invite.uses === 0 ? new Date() : undefined,
        usedById: invite.maxUses === 1 ? userId : undefined,
      },
    });

    this.logger.log(`Invite ${token} used by user ${userId}`);
  }

  async delete(id: string, userId: string, companyId: string): Promise<void> {
    const invite = await this.prisma.invite.findFirst({
      where: { id, companyId },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    if (invite.uses > 0) {
      throw new BadRequestException('Não é possível deletar convite já utilizado');
    }

    await this.prisma.invite.delete({
      where: { id },
    });

    // Log audit
    await this.logAudit(
      AuditAction.DELETE,
      'Invite',
      id,
      userId,
      companyId,
      { email: invite.email, role: invite.role },
    );

    this.logger.log(`Invite ${id} deleted by user ${userId}`);
  }

  private formatInviteResponse(invite: any): InviteResponseDto {
    const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const inviteLink = `${baseUrl}/register?token=${invite.token}`;
    
    let status: 'pending' | 'used' | 'expired' | 'cancelled' = 'pending';
    if (invite.uses >= invite.maxUses) {
      status = 'used';
    } else if (invite.expiresAt < new Date()) {
      status = 'expired';
    }

    return {
      ...invite,
      inviteLink,
      status,
    };
  }

  private canInviteRole(inviterRole: Role, inviteeRole: Role): boolean {
    const roleHierarchy = {
      [Role.MASTER_ADMIN]: 4,
      [Role.ADMIN]: 3,
      [Role.OPERATOR]: 2,
      [Role.CLIENT]: 1,
    };

    return roleHierarchy[inviterRole] >= roleHierarchy[inviteeRole];
  }

  private async logAudit(
    action: AuditAction,
    entityType: string,
    entityId: string,
    userId: string,
    companyId: string,
    metadata: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          entityType,
          entityId,
          userId,
          companyId,
          metadata,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }
}
