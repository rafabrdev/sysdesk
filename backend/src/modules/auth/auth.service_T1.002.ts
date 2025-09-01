// auth.service_T1.002.ts
// Authentication Service - Sprint 1 Task T1.002

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto_T1.002';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto_T1.002';
import { User, AuditAction } from '../../../generated/prisma';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly maxFailedAttempts = 5;
  private readonly lockoutDuration = 30 * 60 * 1000; // 30 minutes

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user with company
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    if (!user) {
      await this.logFailedLogin(email, ipAddress, userAgent);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Conta bloqueada. Tente novamente em ${remainingMinutes} minutos`);
    }

    // Check if user and company are active
    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    if (!user.company.isActive) {
      throw new UnauthorizedException('Empresa inativa');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, ipAddress, userAgent);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);

    // Log successful login
    await this.logAudit(
      AuditAction.LOGIN,
      'User',
      user.id,
      user.id,
      user.companyId,
      { email },
      ipAddress,
      userAgent,
    );

    return {
      ...tokens,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
      user: this.mapUserToResponse(user),
    };
  }

  async refresh(userId: string, refreshToken: string): Promise<AuthResponseDto> {
    // Find session
    const session = await this.prisma.session.findFirst({
      where: {
        userId,
        refreshToken,
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    // Invalidate old session
    await this.prisma.session.update({
      where: { id: session.id },
      data: { isValid: false },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(session.user);

    // Create new session
    await this.createSession(
      session.user.id,
      tokens.refreshToken,
      session.ipAddress || undefined,
      session.userAgent || undefined,
    );

    return {
      ...tokens,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: this.mapUserToResponse(session.user),
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Invalidate specific session
      await this.prisma.session.updateMany({
        where: {
          userId,
          refreshToken,
        },
        data: {
          isValid: false,
          revokedAt: new Date(),
          revokedReason: 'User logout',
        },
      });
    } else {
      // Invalidate all user sessions
      await this.prisma.session.updateMany({
        where: {
          userId,
          isValid: true,
        },
        data: {
          isValid: false,
          revokedAt: new Date(),
          revokedReason: 'User logout (all sessions)',
        },
      });
    }

    // Log logout
    await this.logAudit(
      AuditAction.LOGOUT,
      'User',
      userId,
      userId,
      null,
      { allSessions: !refreshToken },
      undefined,
      undefined,
    );
  }

  async validateUser(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, isActive: true },
      include: {
        company: true,
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    return bcrypt.hash(password, saltRounds);
  }

  private async generateTokens(user: User & { company: any }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });
  }

  private async handleFailedLogin(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) return;

    const failedAttempts = user.failedLoginAttempts + 1;
    const updateData: any = { failedLoginAttempts: failedAttempts };

    // Lock account after max attempts
    if (failedAttempts >= this.maxFailedAttempts) {
      updateData.lockedUntil = new Date(Date.now() + this.lockoutDuration);
      this.logger.warn(`Account locked for user ${user.email} after ${failedAttempts} failed attempts`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await this.logAudit(
      AuditAction.LOGIN_FAILED,
      'User',
      userId,
      userId,
      user.companyId,
      { failedAttempts, locked: failedAttempts >= this.maxFailedAttempts },
      ipAddress,
      userAgent,
    );
  }

  private async logFailedLogin(email: string, ipAddress?: string, userAgent?: string) {
    await this.logAudit(
      AuditAction.LOGIN_FAILED,
      'User',
      null,
      null,
      null,
      { email, reason: 'User not found' },
      ipAddress,
      userAgent,
    );
  }

  private async logAudit(
    action: AuditAction,
    entityType: string,
    entityId: string | null,
    userId: string | null,
    companyId: string | null,
    metadata: any,
    ipAddress?: string,
    userAgent?: string,
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
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  private mapUserToResponse(user: User & { company?: any }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    };
  }
}
