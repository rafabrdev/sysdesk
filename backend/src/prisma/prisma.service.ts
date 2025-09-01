// prisma.service.ts
// Prisma service for T1.002 - Database access layer

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to clean up the database (useful for testing)
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase() is not allowed in production');
    }

    const models = Object.keys(this).filter(
      (key) => key[0] !== '_' && key[0] === key[0].toLowerCase() && key !== 'cleanDatabase',
    );

    for (const model of models) {
      await this[model].deleteMany();
    }
  }
}
