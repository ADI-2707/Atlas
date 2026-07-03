import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ProjectManagementService } from './project-management.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Project Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins/pm')
export class ProjectManagementController {
  constructor(private readonly pmService: ProjectManagementService) {}

  @Post('projects')
  @ApiOperation({ summary: 'Create a new project' })
  async createProject(@Req() req: any, @Body() data: { name: string; key: string; description?: string }) {
    return this.pmService.createProject(req.user.organizationId, data);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get all projects for the organization' })
  async getProjects(@Req() req: any) {
    return this.pmService.getProjects(req.user.organizationId);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get a specific project' })
  async getProject(@Req() req: any, @Param('id') id: string) {
    return this.pmService.getProject(id, req.user.organizationId);
  }

  @Post('projects/:projectId/boards')
  @ApiOperation({ summary: 'Create a board for a project' })
  async createBoard(@Req() req: any, @Param('projectId') projectId: string, @Body() data: { name: string }) {
    return this.pmService.createBoard(req.user.organizationId, projectId, data.name);
  }

  @Post('issues')
  @ApiOperation({ summary: 'Create an issue' })
  async createIssue(@Req() req: any, @Body() data: { projectId: string; title: string; description?: string; status?: string; priority?: string; assigneeId?: string }) {
    return this.pmService.createIssue(req.user.organizationId, data);
  }

  @Get('projects/:projectId/issues')
  @ApiOperation({ summary: 'Get all issues for a project' })
  async getIssues(@Req() req: any, @Param('projectId') projectId: string) {
    return this.pmService.getIssues(req.user.organizationId, projectId);
  }

  @Put('issues/:id')
  @ApiOperation({ summary: 'Update an issue' })
  async updateIssue(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.pmService.updateIssue(id, req.user.organizationId, data);
  }
}
