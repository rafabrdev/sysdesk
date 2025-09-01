// invites.controller_T1.003.ts
// Controller for managing invites - Sprint 1 Task T1.003

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvitesService } from './invites.service_T1.003';
import { CreateInviteDto, InviteResponseDto } from './dto/create-invite.dto_T1.003';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard_T1.002';
import { RolesGuard } from '../../common/guards/roles.guard_T1.003';
import { AdminOnly } from '../../common/decorators/roles.decorator_T1.003';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Invites')
@Controller('api/invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo convite' })
  @ApiResponse({ status: 201, description: 'Convite criado com sucesso', type: InviteResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já existe' })
  @ApiResponse({ status: 403, description: 'Sem permissão para criar convite' })
  @ApiBearerAuth()
  async create(
    @Body() createInviteDto: CreateInviteDto,
    @Request() req: any,
  ): Promise<InviteResponseDto> {
    return this.invitesService.create(
      createInviteDto,
      req.user.id,
      req.user.companyId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @ApiOperation({ summary: 'Listar todos os convites da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de convites', type: [InviteResponseDto] })
  @ApiResponse({ status: 403, description: 'Sem permissão para listar convites' })
  @ApiBearerAuth()
  async findAll(@Request() req: any): Promise<InviteResponseDto[]> {
    return this.invitesService.findAll(req.user.companyId, req.user.id);
  }

  @Get('validate')
  @Public()
  @ApiOperation({ summary: 'Validar token de convite' })
  @ApiQuery({ name: 'token', required: true, description: 'Token do convite' })
  @ApiResponse({ status: 200, description: 'Status de validação do token' })
  async validateToken(
    @Query('token') token: string,
  ): Promise<{ valid: boolean; invite?: InviteResponseDto; error?: string }> {
    return this.invitesService.validateToken(token);
  }

  @Get(':token')
  @Public()
  @ApiOperation({ summary: 'Obter detalhes do convite por token' })
  @ApiResponse({ status: 200, description: 'Detalhes do convite', type: InviteResponseDto })
  @ApiResponse({ status: 404, description: 'Convite não encontrado' })
  @ApiResponse({ status: 400, description: 'Convite expirado ou já utilizado' })
  async findByToken(@Param('token') token: string): Promise<InviteResponseDto> {
    return this.invitesService.findByToken(token);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar/deletar convite' })
  @ApiResponse({ status: 204, description: 'Convite deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Convite não encontrado' })
  @ApiResponse({ status: 400, description: 'Convite já foi utilizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar convite' })
  @ApiBearerAuth()
  async delete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    await this.invitesService.delete(id, req.user.id, req.user.companyId);
  }
}
