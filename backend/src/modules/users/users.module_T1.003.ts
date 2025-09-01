// users.module_T1.003.ts
// Module for user management - Sprint 1 Task T1.003

import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller_T1.003';
import { UsersService } from './users.service_T1.003';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module_T1.002';
import { InvitesModule } from '../invites/invites.module_T1.003';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    InvitesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
