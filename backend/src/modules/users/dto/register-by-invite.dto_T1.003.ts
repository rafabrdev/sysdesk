// register-by-invite.dto_T1.003.ts
// DTO for user registration via invite - Sprint 1 Task T1.003

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsPhoneNumber } from 'class-validator';

export class RegisterByInviteDto {
  @ApiProperty({
    description: 'Token do convite',
    example: 'clh3k5j8a0000qzrr6kq5f3zx',
  })
  @IsNotEmpty({ message: 'Token do convite é obrigatório' })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SenhaForte@123',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Senha deve conter maiúscula, minúscula, número e caractere especial',
    },
  )
  password: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('BR', { message: 'Telefone inválido' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Cargo/posição do usuário',
    example: 'Analista de Suporte',
  })
  @IsOptional()
  @IsString()
  position?: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Indica se o registro foi bem-sucedido',
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de resposta',
    example: 'Usuário registrado com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Dados do usuário criado',
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
    company?: {
      id: string;
      name: string;
      slug: string;
    };
  };

  @ApiPropertyOptional({
    description: 'Token de acesso JWT (opcional, pode exigir login separado)',
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'Refresh token (opcional)',
  })
  refreshToken?: string;
}
