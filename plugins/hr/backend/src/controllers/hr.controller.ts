import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { HrService } from '../services/hr.service';
import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('employees')
  @RequirePermissions('hr.read')
  async getEmployees(@Request() req: any, @Query() query: any) {
    return this.hrService.getEmployees(req.user.organizationId, query);
  }

  @Post('employees')
  @RequirePermissions('hr.create')
  async createEmployee(@Request() req: any, @Body() body: any) {
    return this.hrService.createEmployee(req.user.organizationId, body, req.user.id);
  }

  @Patch('employees/:id')
  @RequirePermissions('hr.update')
  async updateEmployee(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.hrService.updateEmployee(req.user.organizationId, id, body, req.user.id);
  }

  @Delete('employees/:id')
  @RequirePermissions('hr.delete')
  async deleteEmployee(@Request() req: any, @Param('id') id: string) {
    return this.hrService.deleteEmployee(req.user.organizationId, id, req.user.id);
  }

  @Get('payroll')
  @RequirePermissions('hr.payroll.read')
  async getPayrollRecords(@Request() req: any, @Query() query: any) {
    return this.hrService.getPayrollRecords(req.user.organizationId, query);
  }

  @Post('payroll')
  @RequirePermissions('hr.payroll.write')
  async createPayrollRecord(@Request() req: any, @Body() body: any) {
    return this.hrService.createPayrollRecord(req.user.organizationId, body, req.user.id);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.hrService.getAuditLogs(req.user.organizationId, { page, limit, search });
  }
}
