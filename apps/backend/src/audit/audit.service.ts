import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueuesService } from '../queues/queues.service';

export interface AuditLogPayload {
  userId?: string;
  organizationId?: string;
  pluginId?: string;
  action: string;
  result: string;
  ipAddress?: string;
  sessionId?: string;
  details?: any;
}

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queuesService: QueuesService
  ) { }

  async createLog(params: AuditLogPayload) {
    await this.queuesService.addAuditJob(params);
    return true;
  }

  async getLogs(organizationId: string, options: { skip: number, take: number, search?: string }, coreOnly: boolean = false) {
    const where: any = { organizationId };

    if (coreOnly) {
      where.OR = [
        { pluginId: null },
        { action: { in: ['plugin.install', 'plugin.enable', 'plugin.disable', 'plugin.upgrade'] } }
      ];
    }

    if (options.search) {
      const searchCondition = [
        { action: { contains: options.search, mode: 'insensitive' } },
        { result: { contains: options.search, mode: 'insensitive' } },
      ];
      
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchCondition }
        ];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: options.skip,
        take: options.take,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: Math.floor(options.skip / options.take) + 1,
        limit: options.take,
        totalPages: Math.ceil(total / options.take),
      },
    };
  }

  async createSupportTicket(organizationId: string, subject: string, description: string) {
    return this.prisma.supportTicket.create({
      data: {
        organizationId,
        subject,
        description,
      }
    });
  }

  async getOrganizationTickets(organizationId: string) {
    return this.prisma.supportTicket.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
