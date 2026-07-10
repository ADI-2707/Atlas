import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getPaginationParams, buildPaginatedResult } from '@atlas/utils';
import { PmPrismaService } from '../prisma/pm-prisma.service';

@Injectable()
export class ProjectManagementService {
  constructor(
    @Inject('PRISMA_SERVICE') private readonly corePrisma: PrismaClient,
    private readonly pmPrisma: PmPrismaService
  ) { }

  async getLimitStats(organizationId: string) {
    const plugin = await this.corePrisma.plugin.findUnique({
      where: { id: 'project-management' }
    });
    const config: any = plugin?.config || {};
    const tier = config.tier || 'free';

    let maxProjects = 1;
    let maxIssues = 100;

    // New feature flags
    let hasTimelines = false;
    let hasSteps = false;
    let hasSubProjects = false;
    let hasCustomLineups = false;
    let hasErrorTracking = false;

    if (tier === 'tier1') {
      maxProjects = 5; maxIssues = -1;
      hasTimelines = true; hasSteps = true;
    }
    else if (tier === 'tier2') {
      maxProjects = 50; maxIssues = -1;
      hasTimelines = true; hasSteps = true;
      hasSubProjects = true; hasCustomLineups = true;
    }
    else if (tier === 'tier3') {
      maxProjects = -1; maxIssues = -1;
      hasTimelines = true; hasSteps = true;
      hasSubProjects = true; hasCustomLineups = true;
      hasErrorTracking = true;
    }

    const projectCount = await this.pmPrisma.project.count({
      where: { organizationId }
    });
    const issueCount = await this.pmPrisma.issue.count({
      where: { organizationId }
    });

    return {
      tier,
      maxProjects,
      maxIssues,
      projectCount,
      issueCount,
      hasTimelines,
      hasSteps,
      hasSubProjects,
      hasCustomLineups,
      hasErrorTracking
    };
  }

  async getAuditLogs(organizationId: string, query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = getPaginationParams(query);
    const whereCondition: any = { organizationId, pluginId: 'project-management' };

    if (query.search) {
      whereCondition.action = { contains: query.search, mode: 'insensitive' };
    }

    const total = await this.corePrisma.auditLog.count({ where: whereCondition });
    const data = await this.corePrisma.auditLog.findMany({
      where: whereCondition,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return buildPaginatedResult(data, total, page, limit);
  }

  async createProject(organizationId: string, userId: string, data: { name: string; key: string; description?: string; parentId?: string; startDate?: Date; endDate?: Date }) {
    const project = await this.pmPrisma.project.create({
      data: {
        organizationId,
        ...data,
      },
    });

    await this.corePrisma.auditLog.create({
      data: {
        organizationId,
        pluginId: 'project-management',
        action: 'project.created',
        userId,
        result: 'success',
        details: { projectId: project.id, name: project.name }
      }
    });

    return project;
  }

  async getProjects(organizationId: string) {
    return this.pmPrisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProject(id: string, organizationId: string) {
    const project = await this.pmPrisma.project.findFirst({
      where: { id, organizationId },
      include: {
        boards: true,
        issues: true,
        subProjects: true,
        lineups: true,
        errorLogs: true
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async createBoard(organizationId: string, projectId: string, name: string) {
    return this.pmPrisma.board.create({
      data: {
        organizationId,
        projectId,
        name,
      },
    });
  }

  async createIssue(organizationId: string, userId: string, data: { projectId: string; title: string; description?: string; status?: string; priority?: string; assigneeId?: string; startDate?: Date; dueDate?: Date; issueType?: string; estimateHours?: number; lineupId?: string }) {
    const issue = await this.pmPrisma.issue.create({
      data: {
        organizationId,
        ...data,
      },
    });

    await this.corePrisma.auditLog.create({
      data: {
        organizationId,
        pluginId: 'project-management',
        action: 'issue.created',
        userId,
        result: 'success',
        details: { issueId: issue.id, title: issue.title }
      }
    });

    return issue;
  }

  async getIssues(organizationId: string, projectId: string) {
    return this.pmPrisma.issue.findMany({
      where: { organizationId, projectId },
      include: { comments: true, steps: true, lineup: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProject(id: string, organizationId: string, data: { name?: string; description?: string }) {
    const project = await this.pmPrisma.project.findFirst({ where: { id, organizationId } });
    if (!project) throw new NotFoundException('Project not found');
    return this.pmPrisma.project.update({ where: { id }, data });
  }

  async deleteProject(id: string, organizationId: string, userId: string) {
    const project = await this.pmPrisma.project.findFirst({ where: { id, organizationId } });
    if (!project) throw new NotFoundException('Project not found');

    await this.pmPrisma.project.delete({ where: { id } });

    await this.corePrisma.auditLog.create({
      data: {
        organizationId,
        pluginId: 'project-management',
        action: 'project.deleted',
        userId,
        result: 'success',
        details: { projectId: id, name: project.name }
      }
    });

    return project;
  }

  async updateBoard(id: string, organizationId: string, data: { name: string }) {
    const board = await this.pmPrisma.board.findFirst({ where: { id, organizationId } });
    if (!board) throw new NotFoundException('Board not found');
    return this.pmPrisma.board.update({ where: { id }, data });
  }

  async deleteBoard(id: string, organizationId: string) {
    const board = await this.pmPrisma.board.findFirst({ where: { id, organizationId } });
    if (!board) throw new NotFoundException('Board not found');
    return this.pmPrisma.board.delete({ where: { id } });
  }

  async updateIssue(id: string, organizationId: string, data: any) {
    const issue = await this.pmPrisma.issue.findFirst({ where: { id, organizationId } });
    if (!issue) throw new NotFoundException('Issue not found');

    return this.pmPrisma.issue.update({
      where: { id },
      data,
    });
  }

  async deleteIssue(id: string, organizationId: string, userId: string) {
    const issue = await this.pmPrisma.issue.findFirst({ where: { id, organizationId } });
    if (!issue) throw new NotFoundException('Issue not found');

    await this.pmPrisma.issue.delete({ where: { id } });

    await this.corePrisma.auditLog.create({
      data: {
        organizationId,
        pluginId: 'project-management',
        action: 'issue.deleted',
        userId,
        result: 'success',
        details: { issueId: id, title: issue.title }
      }
    });

    return issue;
  }

  async createComment(organizationId: string, issueId: string, authorId: string, text: string) {
    return this.pmPrisma.comment.create({
      data: {
        organizationId,
        issueId,
        authorId,
        text,
      }
    });
  }

  async deleteComment(id: string, organizationId: string) {
    const comment = await this.pmPrisma.comment.findFirst({ where: { id, organizationId } });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.pmPrisma.comment.delete({ where: { id } });
  }

  async createStep(organizationId: string, issueId: string, data: { title: string; order?: number }) {
    return this.pmPrisma.step.create({
      data: {
        organizationId,
        issueId,
        ...data
      }
    });
  }

  async updateStep(id: string, organizationId: string, data: { title?: string; isCompleted?: boolean; order?: number }) {
    const step = await this.pmPrisma.step.findFirst({ where: { id, organizationId } });
    if (!step) throw new NotFoundException('Step not found');
    return this.pmPrisma.step.update({ where: { id }, data });
  }

  async deleteStep(id: string, organizationId: string) {
    const step = await this.pmPrisma.step.findFirst({ where: { id, organizationId } });
    if (!step) throw new NotFoundException('Step not found');
    return this.pmPrisma.step.delete({ where: { id } });
  }

  // --- LINEUPS ---
  async createLineup(organizationId: string, projectId: string, data: { name: string; order?: number; allocatedUserId?: string }) {
    return this.pmPrisma.lineup.create({
      data: {
        organizationId,
        projectId,
        ...data
      }
    });
  }

  async updateLineup(id: string, organizationId: string, data: { name?: string; order?: number; allocatedUserId?: string }) {
    const lineup = await this.pmPrisma.lineup.findFirst({ where: { id, organizationId } });
    if (!lineup) throw new NotFoundException('Lineup not found');
    return this.pmPrisma.lineup.update({ where: { id }, data });
  }

  async deleteLineup(id: string, organizationId: string) {
    const lineup = await this.pmPrisma.lineup.findFirst({ where: { id, organizationId } });
    if (!lineup) throw new NotFoundException('Lineup not found');
    return this.pmPrisma.lineup.delete({ where: { id } });
  }

  // --- ERROR LOGS ---
  async createErrorLog(organizationId: string, projectId: string, data: { message: string; stackTrace?: string; source?: string; status?: string }) {
    return this.pmPrisma.errorLog.create({
      data: {
        organizationId,
        projectId,
        ...data
      }
    });
  }

  async getErrorLogs(organizationId: string, projectId: string) {
    return this.pmPrisma.errorLog.findMany({
      where: { organizationId, projectId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
