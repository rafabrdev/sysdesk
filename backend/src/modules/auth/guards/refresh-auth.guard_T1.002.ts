// refresh-auth.guard_T1.002.ts
// Refresh Token Auth Guard - Sprint 1 Task T1.002

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh') {}
