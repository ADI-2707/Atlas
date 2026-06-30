import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CrmService } from '../services/crm.service';

@ApiTags('crm')
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) { }

  @Get('limits')
  @ApiOperation({ summary: 'Get CRM limits and current usage for the organization' })
  async getLimits(@Req() req: any) {
    return this.crmService.getLimitStats(req.user.organizationId);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get all customers with pagination and search' })
  async getCustomers(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.crmService.getCustomers(req.user.organizationId, { search, page, limit });
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get single customer profile' })
  async getCustomer(@Req() req: any, @Param('id') id: string) {
    return this.crmService.getCustomer(req.user.organizationId, id);
  }

  @Post('customers')
  @ApiOperation({ summary: 'Create new customer or lead' })
  async createCustomer(@Req() req: any, @Body() data: any) {
    return this.crmService.createCustomer(req.user.organizationId, data, req.user.id);
  }

  @Put('customers/:id')
  @ApiOperation({ summary: 'Update customer details' })
  async updateCustomer(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.crmService.updateCustomer(req.user.organizationId, id, data, req.user.id);
  }

  @Delete('customers/:id')
  @ApiOperation({ summary: 'Delete customer record' })
  async deleteCustomer(@Req() req: any, @Param('id') id: string) {
    return this.crmService.deleteCustomer(req.user.organizationId, id, req.user.id);
  }

  @Get('deals')
  @ApiOperation({ summary: 'Get all sales deals' })
  async getDeals(@Req() req: any) {
    return this.crmService.getDeals(req.user.organizationId);
  }

  @Get('deals/:id')
  @ApiOperation({ summary: 'Get single deal record details' })
  async getDeal(@Req() req: any, @Param('id') id: string) {
    return this.crmService.getDeal(req.user.organizationId, id);
  }

  @Post('deals')
  @ApiOperation({ summary: 'Create new sales deal opportunity' })
  async createDeal(@Req() req: any, @Body() data: any) {
    return this.crmService.createDeal(req.user.organizationId, data, req.user.id);
  }

  @Put('deals/:id')
  @ApiOperation({ summary: 'Update sales deal and execute status triggers' })
  async updateDeal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.crmService.updateDeal(req.user.organizationId, id, data, req.user.id);
  }

  @Delete('deals/:id')
  @ApiOperation({ summary: 'Delete sales deal opportunity' })
  async deleteDeal(@Req() req: any, @Param('id') id: string) {
    return this.crmService.deleteDeal(req.user.organizationId, id, req.user.id);
  }

  @Get('schema')
  @ApiOperation({ summary: 'Get CRM contact custom field schema' })
  async getContactSchema() {
    return this.crmService.getContactSchema();
  }

  @Post('schema')
  @ApiOperation({ summary: 'Update CRM contact custom field schema' })
  async updateContactSchema(@Body() schema: any) {
    return this.crmService.updateContactSchema(schema);
  }

  @Get('contacts/export')
  @ApiOperation({ summary: 'Export CRM contacts as CSV' })
  async exportContacts(@Req() req: any) {
    return this.crmService.exportCustomersCsv(req.user.organizationId);
  }

  @Post('contacts/import')
  @ApiOperation({ summary: 'Import CRM contacts from CSV' })
  async importContacts(@Req() req: any, @Body() data: { csv: string }) {
    return this.crmService.importCustomersCsv(req.user.organizationId, data.csv);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get CRM plugin activity audit logs' })
  async getAuditLogs(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.crmService.getCrmAuditLogs(req.user.organizationId, { page, limit, search });
  }
}
