import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

  async getMetrics() {
    const orgs = await this.prisma.organization.findMany({
      include: {
        _count: {
          select: { users: true, auditLogs: true, supportTickets: true }
        }
      }
    });

    const plugins = await this.prisma.plugin.findMany();

    const totalMRR = orgs.reduce((sum, org) => sum + org.mrr, 0);

    return {
      totalOrganizations: orgs.length,
      monthlyRecurringRevenue: totalMRR,
      organizations: orgs.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        mrr: org.mrr,
        healthScore: org.healthScore,
        usersCount: org._count.users,
        auditLogsCount: org._count.auditLogs,
        openTickets: org._count.supportTickets
      }))
    };
  }

  async getSystemLogs(limit = 100) {
    return this.prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getSupportTickets(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.supportTicket.findMany({
      where,
      include: {
        organization: {
          select: { name: true, slug: true, mrr: true, healthScore: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status }
    });
  }
}
