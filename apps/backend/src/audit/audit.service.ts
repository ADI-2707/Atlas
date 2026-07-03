import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

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
    private readonly eventEmitter: EventEmitter2
  ) { }

  async createLog(params: AuditLogPayload) {
    this.eventEmitter.emit('audit.log', params);
    return true;
  }

  @OnEvent('audit.log', { async: true })
  async handleAuditLogEvent(payload: AuditLogPayload) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: payload.userId,
          organizationId: payload.organizationId,
          pluginId: payload.pluginId,
          action: payload.action,
          result: payload.result,
          ipAddress: payload.ipAddress,
          sessionId: payload.sessionId,
          details: payload.details || {},
        },
      });

      await this.prisma.systemLog.create({
        data: {
          level: 'INFO',
          source: 'AUDIT',
          message: `User ${payload.userId || 'Unknown'} performed ${payload.action} with result ${payload.result} in Org ${payload.organizationId || 'None'}`,
          metadata: {
            pluginId: payload.pluginId,
            ipAddress: payload.ipAddress,
            details: payload.details,
          },
        },
      });
    } catch (error) {
      console.error('Failed to write audit log from event:', error);
    }
  }

  async getLogs(organizationId: string, options: { skip: number, take: number, search?: string }) {
    const where: any = { organizationId };

    if (options.search) {
      where.OR = [
        { action: { contains: options.search, mode: 'insensitive' } },
        { result: { contains: options.search, mode: 'insensitive' } },
      ];
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
