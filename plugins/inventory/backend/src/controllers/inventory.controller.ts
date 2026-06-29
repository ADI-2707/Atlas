import { Controller, Get, Post, Patch, Body, Req, Query, Delete } from '@nestjs/common';
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

  @Post('warehouses')
  @ApiOperation({ summary: 'Create a new warehouse' })
  async createWarehouse(@Req() req: any, @Body() data: any) {
    return this.inventoryService.createWarehouse(req.user.organizationId, data);
  }

  @Patch('warehouses/:id')
  @ApiOperation({ summary: 'Update a warehouse' })
  async updateWarehouse(@Req() req: any, @Body() data: any) {
    return this.inventoryService.updateWarehouse(req.user.organizationId, req.params.id, data);
  }

  @Delete('warehouses/:id')
  @ApiOperation({ summary: 'Delete a warehouse' })
  async deleteWarehouse(@Req() req: any) {
    return this.inventoryService.deleteWarehouse(req.user.organizationId, req.params.id);
  }

  @Post('stock/adjust')
  @ApiOperation({ summary: 'Adjust stock quantity for a product in a warehouse' })
  async adjustStock(
    @Req() req: any,
    @Body() data: { productId: string; warehouseId: string; quantity: number },
  ) {
    return this.inventoryService.adjustStock(req.user.organizationId, data, req.user.id);
  }

  @Post('products/:id/stock')
  @ApiOperation({ summary: 'Adjust flat stock for a product (Free/Tier 1 fallback)' })
  async adjustProductFlatStock(
    @Req() req: any,
    @Body() data: { quantity: number },
  ) {
    return this.inventoryService.adjustProductFlatStock(req.user.organizationId, req.params.id, data, req.user.id);
  }

  @Get('stock/transactions')
  @ApiOperation({ summary: 'Get stock transaction logs' })
  async getStockTransactions(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getStockTransactions(req.user.organizationId, {
      search,
      page,
      limit,
    });
  }

  @Get('tables/:id/export')
  @ApiOperation({ summary: 'Export products as CSV' })
  async exportCsv(@Req() req: any) {
    return this.inventoryService.exportProductsCsv(req.user.organizationId, req.params.id);
  }

  @Post('tables/:id/import')
  @ApiOperation({ summary: 'Import products from CSV' })
  async importCsv(
    @Req() req: any,
    @Body() body: { csv: string },
  ) {
    return this.inventoryService.importProductsCsv(req.user.organizationId, req.params.id, body.csv);
  }
}

