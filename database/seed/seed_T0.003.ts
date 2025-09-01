// seed_T0.003.ts
// Database seed script for Sysdesk - Sprint 0 Task T0.003
// Creates initial data for development and testing

import { PrismaClient, Role } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Configuration
const BCRYPT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Sysdesk@2025'; // Default password for test users

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Helper function to generate invite token expiry (7 days from now)
function getInviteExpiry(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clean existing data (development only!)
    console.log('🧹 Cleaning existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.invite.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    // ====================
    // 1. Create BR SISTEMAS company
    // ====================
    console.log('🏢 Creating BR SISTEMAS company...');
    const brSistemas = await prisma.company.create({
      data: {
        name: 'BR SISTEMAS',
        slug: 'br-sistemas',
        cnpj: '00.000.000/0001-00',
        email: 'contato@brsistemas.com.br',
        phone: '(11) 9999-9999',
        address: 'Rua Principal, 123 - Centro - São Paulo/SP',
        settings: {
          theme: 'dark',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
        },
      },
    });

    // ====================
    // 2. Create Master Admin user
    // ====================
    console.log('👤 Creating Master Admin user...');
    const masterPassword = await hashPassword('Master@Admin2025');
    const masterAdmin = await prisma.user.create({
      data: {
        email: 'admin@brsistemas.com.br',
        password: masterPassword,
        name: 'Administrador Master',
        role: Role.MASTER_ADMIN,
        isEmailVerified: true,
        companyId: brSistemas.id,
        phone: '(11) 99999-0001',
      },
    });

    // ====================
    // 3. Create test company
    // ====================
    console.log('🏢 Creating test company (TechCorp)...');
    const techCorp = await prisma.company.create({
      data: {
        name: 'TechCorp Soluções',
        slug: 'techcorp',
        cnpj: '11.111.111/0001-11',
        email: 'contato@techcorp.com.br',
        phone: '(11) 3333-3333',
        address: 'Av. Tecnologia, 500 - Vila Tech - São Paulo/SP',
        settings: {
          theme: 'light',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          businessHours: {
            start: '09:00',
            end: '18:00',
            weekends: false,
          },
        },
      },
    });

    // ====================
    // 4. Create test users for TechCorp
    // ====================
    console.log('👥 Creating test users for TechCorp...');
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

    // Admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@techcorp.com.br',
        password: hashedPassword,
        name: 'João Silva',
        role: Role.ADMIN,
        isEmailVerified: true,
        companyId: techCorp.id,
        phone: '(11) 98765-4321',
      },
    });

    // Operator users
    const operator1 = await prisma.user.create({
      data: {
        email: 'maria.santos@techcorp.com.br',
        password: hashedPassword,
        name: 'Maria Santos',
        role: Role.OPERADOR,
        isEmailVerified: true,
        companyId: techCorp.id,
        phone: '(11) 98765-4322',
      },
    });

    const operator2 = await prisma.user.create({
      data: {
        email: 'pedro.oliveira@techcorp.com.br',
        password: hashedPassword,
        name: 'Pedro Oliveira',
        role: Role.OPERADOR,
        isEmailVerified: true,
        companyId: techCorp.id,
        phone: '(11) 98765-4323',
      },
    });

    // Client users
    const client1 = await prisma.user.create({
      data: {
        email: 'ana.costa@cliente.com.br',
        password: hashedPassword,
        name: 'Ana Costa',
        role: Role.CLIENTE,
        isEmailVerified: true,
        companyId: techCorp.id,
        phone: '(11) 98765-4324',
      },
    });

    const client2 = await prisma.user.create({
      data: {
        email: 'carlos.lima@cliente.com.br',
        password: hashedPassword,
        name: 'Carlos Lima',
        role: Role.CLIENTE,
        isEmailVerified: false,
        companyId: techCorp.id,
        phone: '(11) 98765-4325',
      },
    });

    // ====================
    // 5. Create test invites
    // ====================
    console.log('✉️ Creating test invites...');
    
    // Active invite for new operator
    await prisma.invite.create({
      data: {
        email: 'novo.operador@techcorp.com.br',
        role: Role.OPERADOR,
        companyId: techCorp.id,
        invitedById: adminUser.id,
        expiresAt: getInviteExpiry(),
      },
    });

    // Active invite for new client
    await prisma.invite.create({
      data: {
        email: 'novo.cliente@empresa.com.br',
        role: Role.CLIENTE,
        companyId: techCorp.id,
        invitedById: operator1.id,
        expiresAt: getInviteExpiry(),
      },
    });

    // Expired invite (for testing)
    await prisma.invite.create({
      data: {
        email: 'expirado@teste.com.br',
        role: Role.CLIENTE,
        companyId: techCorp.id,
        invitedById: adminUser.id,
        expiresAt: new Date('2024-01-01'), // Already expired
      },
    });

    // ====================
    // 6. Create audit logs
    // ====================
    console.log('📝 Creating initial audit logs...');
    
    // Master admin login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entityType: 'User',
        entityId: masterAdmin.id,
        userId: masterAdmin.id,
        companyId: brSistemas.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        metadata: {
          success: true,
          method: 'password',
        },
      },
    });

    // Company creation log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Company',
        entityId: techCorp.id,
        userId: masterAdmin.id,
        companyId: brSistemas.id,
        ipAddress: '127.0.0.1',
        metadata: {
          companyName: techCorp.name,
        },
      },
    });

    // User creation logs
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'User',
        entityId: adminUser.id,
        userId: masterAdmin.id,
        companyId: techCorp.id,
        ipAddress: '127.0.0.1',
        metadata: {
          userEmail: adminUser.email,
          userRole: adminUser.role,
        },
      },
    });

    // ====================
    // 7. Summary
    // ====================
    const companiesCount = await prisma.company.count();
    const usersCount = await prisma.user.count();
    const invitesCount = await prisma.invite.count();
    const auditLogsCount = await prisma.auditLog.count();

    console.log('\\n✅ Seed completed successfully!');
    console.log('📊 Database summary:');
    console.log(`   - Companies: ${companiesCount}`);
    console.log(`   - Users: ${usersCount}`);
    console.log(`   - Invites: ${invitesCount}`);
    console.log(`   - Audit logs: ${auditLogsCount}`);
    
    console.log('\\n🔑 Test credentials:');
    console.log('   Master Admin:');
    console.log('     Email: admin@brsistemas.com.br');
    console.log('     Password: Master@Admin2025');
    console.log('\\n   TechCorp Admin:');
    console.log('     Email: admin@techcorp.com.br');
    console.log('     Password: Sysdesk@2025');
    console.log('\\n   TechCorp Operator:');
    console.log('     Email: maria.santos@techcorp.com.br');
    console.log('     Password: Sysdesk@2025');
    console.log('\\n   TechCorp Client:');
    console.log('     Email: ana.costa@cliente.com.br');
    console.log('     Password: Sysdesk@2025');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

// Execute seed
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
