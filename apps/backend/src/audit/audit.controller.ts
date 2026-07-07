import { Controller, Get, Post, Body, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getAuditLogs(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const isAdmin = req.user.roles?.some((role: string) => ['Super Admin', 'Org Admin', 'SYSTEM_ADMIN'].includes(role));
    if (!isAdmin) {
      throw new ForbiddenException('Only organization administrators can view global audit logs');
    }

    const skip = page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 20) : 0;
    const take = limit ? parseInt(limit) : 20;

    return this.auditService.getLogs(req.user.organizationId, { skip, take, search }, true);
  }

  @Get('tickets')
  async getTickets(@Req() req: any) {
    return this.auditService.getOrganizationTickets(req.user.organizationId);
  }

  @Post('tickets')
  async createTicket(@Req() req: any, @Body() body: { subject: string; description: string }) {
    return this.auditService.createSupportTicket(req.user.organizationId, body.subject, body.description);
  }
}
