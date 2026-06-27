import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get organization inventory config' })
  async getConfig(@Req() req: any) {
    return this.inventoryService.getInventoryConfig(req.user.organizationId);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  async getProducts(@Req() req: any) {
    return this.inventoryService.getProducts(req.user.organizationId);
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
