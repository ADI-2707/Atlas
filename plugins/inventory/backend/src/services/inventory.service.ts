import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(@Inject('PRISMA_SERVICE') private readonly prisma: PrismaClient) {}

  async getInventoryConfig(organizationId: string) {
    let config = await this.prisma.inventoryConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      // Default standard fields
      const defaultFields = [
        { name: 'category', label: 'Category', type: 'string' },
        { name: 'weight', label: 'Weight (kg)', type: 'number' }
      ];
      config = await this.prisma.inventoryConfig.create({
        data: {
          organizationId,
          fieldSchema: defaultFields,
        },
      });
    }

    return config;
  }

  async getProducts(organizationId: string) {
    return this.prisma.product.findMany({
      where: { organizationId },
      include: {
        stock: {
          include: { warehouse: true }
        }
      }
    });
  }

  async createProduct(organizationId: string, data: any) {
    return this.prisma.product.create({
      data: {
        organizationId,
        name: data.name,
        sku: data.sku,
        basePrice: data.basePrice || 0,
        customData: data.customData || {},
      },
    });
  }

  async getWarehouses(organizationId: string) {
    return this.prisma.warehouse.findMany({
      where: { organizationId },
    });
  }
}
