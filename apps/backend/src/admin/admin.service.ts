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

    const organizations = orgs.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      status: org.status,
      mrr: org.mrr,
      healthScore: org.healthScore,
      usersCount: org._count.users,
      auditLogsCount: org._count.auditLogs,
      openTickets: org._count.supportTickets
    }));

    // Calculate valueScore for Top 5 ranking
    const highestMrr = Math.max(...organizations.map(o => o.mrr), 1);
    const highestUsers = Math.max(...organizations.map(o => o.usersCount), 1);

    const scoredOrgs = organizations.map(org => {
      const mrrScore = (org.mrr / highestMrr) * 60;
      const userScore = (org.usersCount / highestUsers) * 20;
      const healthScore = (org.healthScore / 100) * 20;
      const valueScore = Math.round(mrrScore + userScore + healthScore);
      return { ...org, valueScore };
    });

    const topClients = [...scoredOrgs]
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 5);

    return {
      totalOrganizations: orgs.length,
      monthlyRecurringRevenue: totalMRR,
      organizations: scoredOrgs,
      topClients
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
