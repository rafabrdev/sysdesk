// refresh.strategy_T1.002.ts
// Refresh Token Strategy - Sprint 1 Task T1.002

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não fornecido');
    }

    // Validate session
    const session = await this.prisma.session.findFirst({
      where: {
        refreshToken,
        userId: payload.sub,
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

    if (!session.user.isActive || !session.user.company.isActive) {
      throw new UnauthorizedException('Usuário ou empresa inativa');
    }

    // Update session last used
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      companyId: session.user.companyId,
      sessionId: session.id,
      refreshToken,
    };
  }
}
