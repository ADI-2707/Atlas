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

  async updateProject(id: string, organizationId: string, data: { name?: string; description?: string }) {
    const project = await this.prisma.project.findFirst({ where: { id, organizationId } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.project.update({ where: { id }, data });
  }

  async deleteProject(id: string, organizationId: string) {
    const project = await this.prisma.project.findFirst({ where: { id, organizationId } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.project.delete({ where: { id } });
  }

  async updateBoard(id: string, organizationId: string, data: { name: string }) {
    const board = await this.prisma.board.findFirst({ where: { id, organizationId } });
    if (!board) throw new NotFoundException('Board not found');
    return this.prisma.board.update({ where: { id }, data });
  }

  async deleteBoard(id: string, organizationId: string) {
    const board = await this.prisma.board.findFirst({ where: { id, organizationId } });
    if (!board) throw new NotFoundException('Board not found');
    return this.prisma.board.delete({ where: { id } });
  }

  async updateIssue(id: string, organizationId: string, data: any) {
    const issue = await this.prisma.issue.findFirst({ where: { id, organizationId } });
    if (!issue) throw new NotFoundException('Issue not found');

    return this.prisma.issue.update({
      where: { id },
      data,
    });
  }

  async deleteIssue(id: string, organizationId: string) {
    const issue = await this.prisma.issue.findFirst({ where: { id, organizationId } });
    if (!issue) throw new NotFoundException('Issue not found');
    return this.prisma.issue.delete({ where: { id } });
  }

  async createComment(organizationId: string, issueId: string, authorId: string, text: string) {
    return this.prisma.comment.create({
      data: {
        organizationId,
        issueId,
        authorId,
        text,
      }
    });
  }

  async deleteComment(id: string, organizationId: string) {
    const comment = await this.prisma.comment.findFirst({ where: { id, organizationId } });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.comment.delete({ where: { id } });
  }
}
