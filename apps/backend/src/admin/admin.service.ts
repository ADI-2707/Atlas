import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

  async getMetrics(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [orgs, totalCount] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        skip,
        take: limit,
        orderBy: { mrr: 'desc' },
        include: {
          _count: {
            select: { users: true, auditLogs: true, supportTickets: true }
          }
        }
      }),
      this.prisma.organization.count(),
    ]);

    const totalMRR = await this.prisma.organization.aggregate({
      _sum: { mrr: true },
    });

    const organizations = orgs.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      status: org.status,
      mrr: org.mrr,
      healthScore: org.healthScore,
      createdAt: org.createdAt,
      usersCount: org._count.users,
      auditLogsCount: org._count.auditLogs,
      openTickets: org._count.supportTickets
    }));

    // Top 5 clients sorted by MRR — resolved entirely in the DB
    const topClients = await this.prisma.organization.findMany({
      take: 5,
      orderBy: { mrr: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        mrr: true,
        healthScore: true,
        _count: { select: { users: true } },
      },
    });

    return {
      totalOrganizations: totalCount,
      monthlyRecurringRevenue: totalMRR._sum.mrr ?? 0,
      pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) },
      organizations,
      topClients: topClients.map(o => ({ ...o, usersCount: o._count.users })),
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
