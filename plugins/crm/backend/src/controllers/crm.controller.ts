import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('crm')
@Controller('crm')
export class CrmController {
  @Get('customers')
  @ApiOperation({ summary: 'Get all customers' })
  getCustomers() {
    return [{ id: 1, name: 'Customer A' }];
  }
}
