// seed-auth_T1.002.ts
// Seed script for testing authentication - Sprint 1 Task T1.002

import { PrismaClient } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting auth seed...');

  // Hash password
  const hashedPassword = await bcrypt.hash('Master@Admin2025', 12);

  // Create BR SISTEMAS company
  const brSistemas = await prisma.company.upsert({
    where: { slug: 'br-sistemas' },
    update: {},
    create: {
      name: 'BR SISTEMAS',
      slug: 'br-sistemas',
      cnpj: '00.000.000/0001-00',
      email: 'contato@brsistemas.com.br',
      phone: '(11) 99999-9999',
      plan: 'ENTERPRISE',
      maxUsers: 999,
      maxAgents: 999,
      isActive: true,
    },
  });

  // Create master admin user
  const masterAdmin = await prisma.user.upsert({
    where: { email: 'admin@brsistemas.com.br' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@brsistemas.com.br',
      password: hashedPassword,
      name: 'Admin Master',
      role: 'MASTER_ADMIN',
      companyId: brSistemas.id,
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create a test company
  const testCompany = await prisma.company.upsert({
    where: { slug: 'test-company' },
    update: {},
    create: {
      name: 'Test Company',
      slug: 'test-company',
      cnpj: '11.111.111/0001-11',
      email: 'contato@testcompany.com.br',
      phone: '(11) 88888-8888',
      plan: 'BASIC',
      maxUsers: 10,
      maxAgents: 3,
      isActive: true,
    },
  });

  // Create test users
  const testPassword = await bcrypt.hash('Test@2025', 12);

  const testAdmin = await prisma.user.upsert({
    where: { email: 'admin@testcompany.com.br' },
    update: {
      password: testPassword,
    },
    create: {
      email: 'admin@testcompany.com.br',
      password: testPassword,
      name: 'Test Admin',
      role: 'ADMIN',
      companyId: testCompany.id,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const testOperator = await prisma.user.upsert({
    where: { email: 'operator@testcompany.com.br' },
    update: {
      password: testPassword,
    },
    create: {
      email: 'operator@testcompany.com.br',
      password: testPassword,
      name: 'Test Operator',
      role: 'OPERATOR',
      companyId: testCompany.id,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const testClient = await prisma.user.upsert({
    where: { email: 'client@testcompany.com.br' },
    update: {
      password: testPassword,
    },
    create: {
      email: 'client@testcompany.com.br',
      password: testPassword,
      name: 'Test Client',
      role: 'CLIENT',
      companyId: testCompany.id,
      isActive: true,
      isEmailVerified: false,
    },
  });

  console.log('✅ Auth seed completed!');
  console.log('\n📝 Test credentials:');
  console.log('Master Admin: admin@brsistemas.com.br / Master@Admin2025');
  console.log('Test Admin: admin@testcompany.com.br / Test@2025');
  console.log('Test Operator: operator@testcompany.com.br / Test@2025');
  console.log('Test Client: client@testcompany.com.br / Test@2025');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
