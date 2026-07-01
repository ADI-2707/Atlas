import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  async getMetrics(@Req() req: any) {
    // In a real scenario, verify req.user has SUPER_ADMIN role
    if (!req.user) throw new UnauthorizedException();
    
    return this.adminService.getMetrics();
  }
}
