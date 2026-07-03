import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectManagementService {
  constructor(private readonly prisma: PrismaService) { }

  async createProject(organizationId: string, data: { name: string; key: string; description?: string }) {
    return this.prisma.project.create({
      data: {
        organizationId,
        ...data,
      },
    });
  }

  async getProjects(organizationId: string) {
    return this.prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProject(id: string, organizationId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId },
      include: { boards: true, issues: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async createBoard(organizationId: string, projectId: string, name: string) {
    return this.prisma.board.create({
      data: {
        organizationId,
        projectId,
        name,
      },
    });
  }

  async createIssue(organizationId: string, data: { projectId: string; title: string; description?: string; status?: string; priority?: string; assigneeId?: string }) {
    return this.prisma.issue.create({
      data: {
        organizationId,
        ...data,
      },
    });
  }

  async getIssues(organizationId: string, projectId: string) {
    return this.prisma.issue.findMany({
      where: { organizationId, projectId },
      include: { comments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateIssue(id: string, organizationId: string, data: any) {
    const issue = await this.prisma.issue.findFirst({ where: { id, organizationId } });
    if (!issue) throw new NotFoundException('Issue not found');

    return this.prisma.issue.update({
      where: { id },
      data,
    });
  }
}
