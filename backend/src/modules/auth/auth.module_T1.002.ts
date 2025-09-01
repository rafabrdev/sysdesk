// auth.module_T1.002.ts
// Authentication Module - Sprint 1 Task T1.002

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller_T1.002';
import { AuthService } from './auth.service_T1.002';
import { JwtStrategy } from './strategies/jwt.strategy_T1.002';
import { RefreshStrategy } from './strategies/refresh.strategy_T1.002';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev_jwt_secret_change_in_production'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
