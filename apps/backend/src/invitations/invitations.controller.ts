import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('User Invitations')
@ApiBearerAuth()
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @RequirePermissions('users.write')
  @ApiOperation({ summary: 'Invite a new employee' })
  @ApiResponse({ status: 201, description: 'Invitation created and email mock-sent successfully' })
  async create(@Body() dto: InviteUserDto, @CurrentUser() user: any) {
    return this.invitationsService.create(dto, user.organizationId, user.id);
  }

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'List all invitations in the organization' })
  @ApiResponse({ status: 200, description: 'Return all organization invitations' })
  async findAll(@CurrentUser() user: any) {
    return this.invitationsService.findAll(user.organizationId);
  }

  @Delete(':id')
  @RequirePermissions('users.write')
  @ApiOperation({ summary: 'Revoke an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation revoked successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.invitationsService.revoke(id, user.organizationId, user.id);
  }
}
