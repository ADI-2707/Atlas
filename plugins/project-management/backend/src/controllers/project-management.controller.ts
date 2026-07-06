import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query } from '@nestjs/common';
import { ProjectManagementService } from '../services/project-management.service';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Project Management')
@ApiBearerAuth()
@Controller('plugins/project-management')
export class ProjectManagementController {
  constructor(private readonly pmService: ProjectManagementService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get PM limit stats' })
  async getStats(@Req() req: any) {
    return this.pmService.getLimitStats(req.user.organizationId);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get Project Management plugin activity audit logs' })
  async getAuditLogs(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.pmService.getAuditLogs(req.user.organizationId, { page, limit, search });
  }

  @Post('projects')
  @ApiOperation({ summary: 'Create a new project' })
  async createProject(@Req() req: any, @Body() data: { name: string; key: string; description?: string }) {
    return this.pmService.createProject(req.user.organizationId, req.user.id, data);
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
    return this.pmService.createIssue(req.user.organizationId, req.user.id, data);
  }

  @Get('projects/:projectId/issues')
  @ApiOperation({ summary: 'Get all issues for a project' })
  async getIssues(@Req() req: any, @Param('projectId') projectId: string) {
    return this.pmService.getIssues(req.user.organizationId, projectId);
  }

  @Put('projects/:id')
  @ApiOperation({ summary: 'Update a project' })
  async updateProject(@Req() req: any, @Param('id') id: string, @Body() data: { name?: string; description?: string }) {
    return this.pmService.updateProject(id, req.user.organizationId, data);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Delete a project' })
  async deleteProject(@Req() req: any, @Param('id') id: string) {
    return this.pmService.deleteProject(id, req.user.organizationId, req.user.id);
  }

  @Put('boards/:id')
  @ApiOperation({ summary: 'Update a board' })
  async updateBoard(@Req() req: any, @Param('id') id: string, @Body() data: { name: string }) {
    return this.pmService.updateBoard(id, req.user.organizationId, data);
  }

  @Delete('boards/:id')
  @ApiOperation({ summary: 'Delete a board' })
  async deleteBoard(@Req() req: any, @Param('id') id: string) {
    return this.pmService.deleteBoard(id, req.user.organizationId);
  }

  @Put('issues/:id')
  @ApiOperation({ summary: 'Update an issue' })
  async updateIssue(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.pmService.updateIssue(id, req.user.organizationId, data);
  }

  @Delete('issues/:id')
  @ApiOperation({ summary: 'Delete an issue' })
  async deleteIssue(@Req() req: any, @Param('id') id: string) {
    return this.pmService.deleteIssue(id, req.user.organizationId, req.user.id);
  }

  @Post('issues/:issueId/comments')
  @ApiOperation({ summary: 'Create a comment on an issue' })
  async createComment(@Req() req: any, @Param('issueId') issueId: string, @Body() data: { text: string }) {
    return this.pmService.createComment(req.user.organizationId, issueId, req.user.id, data.text);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(@Req() req: any, @Param('id') id: string) {
    return this.pmService.deleteComment(id, req.user.organizationId);
  }

  // --- STEPS ---
  @Post('issues/:issueId/steps')
  @ApiOperation({ summary: 'Create a step for an issue' })
  async createStep(@Req() req: any, @Param('issueId') issueId: string, @Body() data: { title: string; order?: number }) {
    return this.pmService.createStep(req.user.organizationId, issueId, data);
  }

  @Put('steps/:id')
  @ApiOperation({ summary: 'Update a step' })
  async updateStep(@Req() req: any, @Param('id') id: string, @Body() data: { title?: string; isCompleted?: boolean; order?: number }) {
    return this.pmService.updateStep(id, req.user.organizationId, data);
  }

  @Delete('steps/:id')
  @ApiOperation({ summary: 'Delete a step' })
  async deleteStep(@Req() req: any, @Param('id') id: string) {
    return this.pmService.deleteStep(id, req.user.organizationId);
  }

  // --- LINEUPS ---
  @Post('projects/:projectId/lineups')
  @ApiOperation({ summary: 'Create a lineup (custom stage) for a project' })
  async createLineup(@Req() req: any, @Param('projectId') projectId: string, @Body() data: { name: string; order?: number; allocatedUserId?: string }) {
    return this.pmService.createLineup(req.user.organizationId, projectId, data);
  }

  @Put('lineups/:id')
  @ApiOperation({ summary: 'Update a lineup' })
  async updateLineup(@Req() req: any, @Param('id') id: string, @Body() data: { name?: string; order?: number; allocatedUserId?: string }) {
    return this.pmService.updateLineup(id, req.user.organizationId, data);
  }

  @Delete('lineups/:id')
  @ApiOperation({ summary: 'Delete a lineup' })
  async deleteLineup(@Req() req: any, @Param('id') id: string) {
    return this.pmService.deleteLineup(id, req.user.organizationId);
  }

  // --- ERROR LOGS ---
  @Post('projects/:projectId/error-logs')
  @ApiOperation({ summary: 'Create an error log for a project' })
  async createErrorLog(@Req() req: any, @Param('projectId') projectId: string, @Body() data: { message: string; stackTrace?: string; source?: string; status?: string }) {
    return this.pmService.createErrorLog(req.user.organizationId, projectId, data);
  }

  @Get('projects/:projectId/error-logs')
  @ApiOperation({ summary: 'Get error logs for a project' })
  async getErrorLogs(@Req() req: any, @Param('projectId') projectId: string) {
    return this.pmService.getErrorLogs(req.user.organizationId, projectId);
  }
}
