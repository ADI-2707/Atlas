import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  @Get('products')
  @ApiOperation({ summary: 'Get all products (mocked)' })
  async getProducts() {
    return [
      { id: '1', name: 'Product A', stock: 100 },
      { id: '2', name: 'Product B', stock: 50 },
    ];
  }
}
