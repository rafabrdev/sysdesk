// create-invite.dto_T1.003.ts
// DTO for creating invites - Sprint 1 Task T1.003

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { Role } from '../../../../generated/prisma';

export class CreateInviteDto {
  @ApiProperty({
    description: 'Email do convidado',
    example: 'novo.usuario@empresa.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiPropertyOptional({
    description: 'Nome do convidado',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Papel do novo usuário',
    enum: Role,
    example: Role.CLIENT,
  })
  @IsEnum(Role, { message: 'Papel inválido' })
  @IsNotEmpty({ message: 'Papel é obrigatório' })
  role: Role;

  @ApiPropertyOptional({
    description: 'Departamento do usuário',
    example: 'TI',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Mensagem personalizada para o convidado',
    example: 'Bem-vindo à nossa equipe!',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Número máximo de usos do convite',
    default: 1,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxUses?: number = 1;

  @ApiPropertyOptional({
    description: 'Data de expiração do convite (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class InviteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  invitedById: string;

  @ApiProperty()
  invitedBy?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiPropertyOptional()
  usedById?: string;

  @ApiProperty()
  maxUses: number;

  @ApiProperty()
  uses: number;

  @ApiProperty()
  expiresAt: Date;

  @ApiPropertyOptional()
  usedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    description: 'Link de convite completo',
    example: 'https://sysdesk.com/register?token=abc123',
  })
  inviteLink?: string;

  @ApiProperty({
    description: 'Status do convite',
    enum: ['pending', 'used', 'expired', 'cancelled'],
  })
  status: 'pending' | 'used' | 'expired' | 'cancelled';
}

export class ValidateInviteDto {
  @ApiProperty({
    description: 'Token do convite',
    example: 'clh3k5j8a0000qzrr6kq5f3zx',
  })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString()
  token: string;
}
