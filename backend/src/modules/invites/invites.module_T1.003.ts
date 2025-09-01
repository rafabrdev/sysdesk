// invites.module_T1.003.ts
// Module for invite management - Sprint 1 Task T1.003

import { Module, forwardRef } from '@nestjs/common';
import { InvitesController } from './invites.controller_T1.003';
import { InvitesService } from './invites.service_T1.003';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module_T1.002';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
