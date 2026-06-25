import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(params: {
    userId?: string;
    organizationId?: string;
    pluginId?: string;
    action: string;
    result: string;
    ipAddress?: string;
    sessionId?: string;
    details?: any;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          organizationId: params.organizationId,
          pluginId: params.pluginId,
          action: params.action,
          result: params.result,
          ipAddress: params.ipAddress,
          sessionId: params.sessionId,
          details: params.details || {},
        },
      });
    } catch (error) {
      
      console.error('Failed to write audit log:', error);
      return null;
    }
  }
}
