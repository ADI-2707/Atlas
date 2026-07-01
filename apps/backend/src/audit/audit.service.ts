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
  ) {}

  async createLog(params: AuditLogPayload) {
    // Fire and forget via event emitter
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
    } catch (error) {
      console.error('Failed to write audit log from event:', error);
    }
  }
}
