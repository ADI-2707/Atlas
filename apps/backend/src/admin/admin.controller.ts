import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  private checkSuperAdmin(req: any) {
    if (!req.user || !req.user.email) throw new UnauthorizedException('Super Admin access required');
  }

  @Get('metrics')
  async getMetrics(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.checkSuperAdmin(req);
    return this.adminService.getMetrics(
      page ? parseInt(page, 10) : 1,
      limit ? Math.min(parseInt(limit, 10), 200) : 50,
    );
  }

  @Get('logs')
  async getSystemLogs(@Req() req: any, @Query('limit') limit?: string) {
    this.checkSuperAdmin(req);
    return this.adminService.getSystemLogs(limit ? parseInt(limit, 10) : 100);
  }

  @Get('tickets')
  async getTickets(@Req() req: any, @Query('status') status?: string) {
    this.checkSuperAdmin(req);
    return this.adminService.getSupportTickets(status);
  }

  @Post('tickets/:id/resolve')
  async resolveTicket(@Req() req: any, @Param('id') id: string) {
    this.checkSuperAdmin(req);
    return this.adminService.updateTicketStatus(id, 'RESOLVED');
  }
}
