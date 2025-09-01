// users.controller_T1.003.ts  
// Controller for user management - Sprint 1 Task T1.003

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service_T1.003';
import { RegisterByInviteDto, RegisterResponseDto } from './dto/register-by-invite.dto_T1.003';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard_T1.002';
import { RolesGuard } from '../../common/guards/roles.guard_T1.003';
import { AdminOnly, OperatorOnly } from '../../common/decorators/roles.decorator_T1.003';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Users')
@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register-by-invite')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo usuário via convite' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Convite inválido ou expirado' })
  @ApiResponse({ status: 409, description: 'Usuário já existe' })
  async registerByInvite(@Body() dto: RegisterByInviteDto): Promise<RegisterResponseDto> {
    return this.usersService.registerByInvite(dto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @OperatorOnly()
  @ApiOperation({ summary: 'Listar usuários da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  @ApiBearerAuth()
  async findAll(@Request() req: any) {
    return this.usersService.findAll(req.user.companyId);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @OperatorOnly()
  @ApiOperation({ summary: 'Obter detalhes do usuário' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.usersService.findOne(id, req.user.companyId);
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req: any,
  ) {
    return this.usersService.update(id, updateData, req.user.companyId, req.user.id);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar usuário' })
  @ApiBearerAuth()
  async deactivate(@Param('id') id: string, @Request() req: any) {
    await this.usersService.deactivate(id, req.user.companyId, req.user.id);
  }
}
