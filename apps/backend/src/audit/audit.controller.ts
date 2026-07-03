import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
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
    const skip = page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 20) : 0;
    const take = limit ? parseInt(limit) : 20;

    return this.auditService.getLogs(req.user.organizationId, { skip, take, search });
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
