// auth-response.dto_T1.002.ts
// Auth response DTO - Sprint 1 Task T1.002

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Role } from '../../../generated/prisma';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isEmailVerified: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Access token expiration in seconds',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken: string;
}
