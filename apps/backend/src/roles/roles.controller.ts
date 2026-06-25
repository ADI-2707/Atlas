import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Role Management')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Create a custom role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: any) {
    return this.rolesService.create(dto, user.organizationId, user.id);
  }

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get all roles in the organization' })
  @ApiResponse({ status: 200, description: 'Return list of roles' })
  async findAll(@CurrentUser() user: any) {
    return this.rolesService.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get role details by ID' })
  @ApiResponse({ status: 200, description: 'Return role details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.rolesService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Update custom role details' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.rolesService.update(id, dto, user.organizationId, user.id);
  }

  @Delete(':id')
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Delete custom role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.rolesService.remove(id, user.organizationId, user.id);
  }
}

@ApiTags('Permission Reference')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get all system permissions' })
  @ApiResponse({ status: 200, description: 'Return list of permissions' })
  async findAll() {
    return this.rolesService.findAllPermissions();
  }
}
