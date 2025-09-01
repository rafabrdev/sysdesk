// auth.controller_T1.002.ts
// Authentication Controller - Sprint 1 Task T1.002

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service_T1.002';
import { LoginDto } from './dto/login.dto_T1.002';
import { AuthResponseDto, RefreshTokenDto } from './dto/auth-response.dto_T1.002';
import { JwtAuthGuard } from './guards/jwt-auth.guard_T1.002';
import { RefreshAuthGuard } from './guards/refresh-auth.guard_T1.002';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBearerAuth()
  async refresh(@Request() req): Promise<AuthResponseDto> {
    return this.authService.refresh(req.user.id, req.user.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async logout(
    @Request() req,
    @Body() body?: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(req.user.id, body?.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async me(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      companyId: req.user.companyId,
      company: req.user.company,
    };
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  @ApiBearerAuth()
  async validate(@Request() req) {
    return { valid: true, userId: req.user.id };
  }
}
