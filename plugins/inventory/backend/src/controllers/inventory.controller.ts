import { Controller, Get, Post, Patch, Body, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get inventory storage and table limit stats' })
  async getStats(@Req() req: any) {
    return this.inventoryService.getLimitStats(req.user.organizationId);
  }

  @Get('tables')
  @ApiOperation({ summary: 'Get all inventory tables' })
  async getTables(@Req() req: any) {
    return this.inventoryService.getTables(req.user.organizationId);
  }

  @Post('tables')
  @ApiOperation({ summary: 'Create a new inventory table' })
  async createTable(@Req() req: any, @Body() data: any) {
    return this.inventoryService.createTable(req.user.organizationId, data);
  }

  @Patch('tables/:id/schema')
  @ApiOperation({ summary: 'Update table schema' })
  async updateTableSchema(
    @Req() req: any,
    @Body() data: any,
  ) {
    return this.inventoryService.updateTableSchema(req.user.organizationId, req.params.id, data);
  }

  @Get('tables/:id/products')
  @ApiOperation({ summary: 'Get all products for a table' })
  async getProducts(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getProducts(req.user.organizationId, req.params.id, {
      search,
      page,
      limit,
    });
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a product' })
  async createProduct(
    @Req() req: any,
    @Body() data: any,
  ) {
    return this.inventoryService.createProduct(req.user.organizationId, data);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Get all warehouses' })
  async getWarehouses(@Req() req: any) {
    return this.inventoryService.getWarehouses(req.user.organizationId);
  }
}
