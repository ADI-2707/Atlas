import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getPaginationParams, buildPaginatedResult } from '@atlas/utils';

@Injectable()
export class InventoryService {
  constructor(@Inject('PRISMA_SERVICE') private readonly prisma: PrismaClient) { }

  async getLimitStats(organizationId: string) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id: 'inventory' }
    });
    const config: any = plugin?.config || {};
    const tier = config.tier || 'free';

    let maxTables = 1;
    let maxProducts = 50;
    if (tier === 'tier1') { maxTables = 5; maxProducts = 1000; }
    else if (tier === 'tier2') { maxTables = 10; maxProducts = 10000; }
    else if (tier === 'tier3') { maxTables = 25; maxProducts = 100000; }

    let maxWarehouses = 0;
    if (tier === 'tier2') maxWarehouses = 5;
    else if (tier === 'tier3') maxWarehouses = 20;

    const warehouseCount = await this.prisma.warehouse.count({
      where: { organizationId }
    });

    const tableCount = await this.prisma.inventoryTable.count({
      where: { organizationId }
    });
    const productCount = await this.prisma.product.count({
      where: { organizationId }
    });

    const usagePercent = productCount / maxProducts;

    if (usagePercent >= 0.90) {
      const now = Date.now();
      const lastAlert = config.lastLimitAlertTime ? Number(config.lastLimitAlertTime) : 0;
      const eightHoursMs = 8 * 60 * 60 * 1000;

      if (now - lastAlert >= eightHoursMs) {
        const updatedConfig = { ...config, lastLimitAlertTime: String(now) };
        await this.prisma.plugin.update({
          where: { id: 'inventory' },
          data: { config: updatedConfig }
        });

        await this.prisma.auditLog.create({
          data: {
            organizationId,
            pluginId: 'inventory',
            action: 'inventory.limit.warning',
            result: 'SUCCESS',
            details: {
              message: `Inventory usage has exceeded 90% (${productCount}/${maxProducts} items)`,
              usagePercent: (usagePercent * 100).toFixed(1) + '%'
            }
          }
        });
      }
    }

    return {
      tier,
      tableCount,
      maxTables,
      productCount,
      maxProducts,
      usagePercent,
      warehouseCount,
      maxWarehouses
    };
  }

  async getTables(organizationId: string) {
    let tables = await this.prisma.inventoryTable.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' }
    });

    if (tables.length === 0) {
      const defaultFields = [
        { name: 'category', label: 'Category', type: 'string' },
        { name: 'weight', label: 'Weight (kg)', type: 'number' }
      ];
      const defaultTable = await this.prisma.inventoryTable.create({
        data: {
          organizationId,
          name: 'Main Inventory',
          fieldSchema: defaultFields,
        },
      });
      tables = [defaultTable];
    }

    return tables;
  }

  async createTable(organizationId: string, data: any) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id: 'inventory' }
    });
    const config: any = plugin?.config || {};
    const tier = config.tier || 'free';

    let maxTables = 1;
    if (tier === 'tier1') maxTables = 5;
    else if (tier === 'tier2') maxTables = 10;
    else if (tier === 'tier3') maxTables = 25;

    const currentCount = await this.prisma.inventoryTable.count({
      where: { organizationId }
    });

    if (currentCount >= maxTables) {
      throw new Error(`Tier limit reached. Upgrade to add more than ${maxTables} tables.`);
    }

    return this.prisma.inventoryTable.create({
      data: {
        organizationId,
        name: data.name,
        fieldSchema: data.fieldSchema || [],
      },
    });
  }

  async updateTableSchema(organizationId: string, tableId: string, fieldSchema: any) {
    return this.prisma.inventoryTable.update({
      where: { id: tableId, organizationId },
      data: { fieldSchema },
    });
  }

  async getProducts(
    organizationId: string,
    tableId: string,
    query: { search?: string; page?: string; limit?: string }
  ) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id: 'inventory' }
    });
    const config: any = plugin?.config || {};
    const tier = config.tier || 'free';

    let maxProducts = 50;
    if (tier === 'tier1') maxProducts = 1000;
    else if (tier === 'tier2') maxProducts = 10000;
    else if (tier === 'tier3') maxProducts = 100000;

    const allowedProducts = await this.prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
      take: maxProducts,
      select: { id: true }
    });
    const allowedIds = allowedProducts.map(p => p.id);

    const whereCondition: any = {
      organizationId,
      tableId,
      id: { in: allowedIds }
    };

    if (query.search) {
      whereCondition.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const { page, limit, skip } = getPaginationParams(query);

    const total = await this.prisma.product.count({
      where: whereCondition
    });

    const data = await this.prisma.product.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: {
        stock: {
          include: { warehouse: true }
        }
      }
    });

    return buildPaginatedResult(data, total, page, limit);
  }

  async createProduct(organizationId: string, data: any) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id: 'inventory' }
    });
    const config: any = plugin?.config || {};
    const tier = config.tier || 'free';

    let maxProducts = 50;
    if (tier === 'tier1') maxProducts = 1000;
    else if (tier === 'tier2') maxProducts = 10000;
    else if (tier === 'tier3') maxProducts = 100000;

    const currentProductCount = await this.prisma.product.count({
      where: { organizationId }
    });

    if (currentProductCount / maxProducts >= 0.995) {
      throw new Error(`Critical storage limit reached (>=99.5%). Upgrade your subscription plan to modify or add items.`);
    }

    if (currentProductCount >= maxProducts) {
      throw new Error(`Item limit reached. Upgrade your plan to store more than ${maxProducts} products.`);
    }

    return this.prisma.product.create({
      data: {
        organizationId,
        tableId: data.tableId,
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
      orderBy: { name: 'asc' }
    });
  }

  async createWarehouse(organizationId: string, data: any) {
    const stats = await this.getLimitStats(organizationId);
    if (stats.maxWarehouses === 0) {
      throw new Error(`Warehouse feature is not available on your current plan (${stats.tier}). Upgrade to Business (Tier 2) or Enterprise (Tier 3).`);
    }
    if (stats.warehouseCount >= stats.maxWarehouses) {
      throw new Error(`Warehouse limit reached. Upgrade your plan to store more than ${stats.maxWarehouses} warehouses.`);
    }

    return this.prisma.warehouse.create({
      data: {
        organizationId,
        name: data.name,
        location: data.location || null,
      },
    });
  }

  async updateWarehouse(organizationId: string, id: string, data: any) {
    return this.prisma.warehouse.update({
      where: { id, organizationId },
      data: {
        name: data.name,
        location: data.location !== undefined ? data.location : undefined,
      },
    });
  }

  async deleteWarehouse(organizationId: string, id: string) {
    return this.prisma.warehouse.delete({
      where: { id, organizationId },
    });
  }

  async adjustStock(
    organizationId: string,
    data: { productId: string; warehouseId: string; quantity: number },
    userId?: string,
  ) {
    const currentStock = await this.prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
    });

    const previousQty = currentStock ? currentStock.quantity : 0;
    const diff = data.quantity - previousQty;

    const stock = await this.prisma.stock.upsert({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
      update: {
        quantity: data.quantity,
      },
      create: {
        organizationId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
      },
    });

    if (diff !== 0) {
      await this.prisma.stockTransaction.create({
        data: {
          organizationId,
          productId: data.productId,
          warehouseId: data.warehouseId,
          type: 'ADJUSTMENT',
          quantity: diff,
          reference: `Manual adjustment from UI (set to ${data.quantity})`,
          userId: userId || null,
        },
      });
    }

    return stock;
  }

  async getStockTransactions(organizationId: string, query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = getPaginationParams(query);

    const whereCondition: any = {
      organizationId,
    };

    if (query.search) {
      whereCondition.product = {
        name: { contains: query.search, mode: 'insensitive' },
      };
    }

    const total = await this.prisma.stockTransaction.count({
      where: whereCondition,
    });

    const data = await this.prisma.stockTransaction.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        product: true,
        warehouse: true,
        toWarehouse: true,
      },
    });

    return buildPaginatedResult(data, total, page, limit);
  }

  async exportProductsCsv(organizationId: string, tableId: string) {
    const activeTable = await this.prisma.inventoryTable.findUnique({
      where: { id: tableId, organizationId },
    });
    if (!activeTable) throw new Error('Table not found');

    const customFields = (activeTable.fieldSchema as any[]) || [];

    const plugin = await this.prisma.plugin.findUnique({
      where: { id: 'inventory' },
    });
    const config: any = plugin?.config || {};
    const tier = config.tier || 'free';

    let maxProducts = 50;
    if (tier === 'tier1') maxProducts = 1000;
    else if (tier === 'tier2') maxProducts = 10000;
    else if (tier === 'tier3') maxProducts = 100000;

    const allowedProducts = await this.prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
      take: maxProducts,
      select: { id: true },
    });
    const allowedIds = allowedProducts.map((p) => p.id);

    const products = await this.prisma.product.findMany({
      where: {
        organizationId,
        tableId,
        id: { in: allowedIds },
      },
      orderBy: { createdAt: 'asc' },
    });

    const headers = ['SKU', 'Name', 'Base Price', ...customFields.map((f) => f.label)];
    const rows = products.map((p) => {
      const row = [p.sku, p.name, p.basePrice, ...customFields.map((f) => (p.customData as any)?.[f.name] || '')];
      return row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    return { csv: csvContent };
  }

  async importProductsCsv(organizationId: string, tableId: string, csvContent: string) {
    const activeTable = await this.prisma.inventoryTable.findUnique({
      where: { id: tableId, organizationId },
    });
    if (!activeTable) throw new Error('Table not found');

    const customFields = (activeTable.fieldSchema as any[]) || [];

    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) throw new Error('CSV is empty or invalid');

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
    const skuIdx = headers.indexOf('SKU');
    const nameIdx = headers.indexOf('Name');
    const priceIdx = headers.indexOf('Base Price');

    if (skuIdx === -1 || nameIdx === -1 || priceIdx === -1) {
      throw new Error('CSV must contain SKU, Name, and Base Price columns');
    }

    const imported = [];
    let skipped = 0;

    const plugin = await this.prisma.plugin.findUnique({
      where: { id: 'inventory' },
    });
    const config: any = plugin?.config || {};
    const tier = config.tier || 'free';

    let maxProducts = 50;
    if (tier === 'tier1') maxProducts = 1000;
    else if (tier === 'tier2') maxProducts = 10000;
    else if (tier === 'tier3') maxProducts = 100000;

    const currentCount = await this.prisma.product.count({
      where: { organizationId },
    });

    let spaceLeft = maxProducts - currentCount;

    for (let i = 1; i < lines.length; i++) {
      if (spaceLeft <= 0) break;

      const row = [];
      let current = '';
      let inQuotes = false;
      const line = lines[i];

      for (let k = 0; k < line.length; k++) {
        const char = line[k];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim());
      const parsedRow = row.map((s) => s.replace(/^"|"$/g, '').replace(/""/g, '"'));

      if (parsedRow.length < headers.length) {
        skipped++;
        continue;
      }

      const sku = parsedRow[skuIdx];
      const name = parsedRow[nameIdx];
      const basePrice = parseFloat(parsedRow[priceIdx]) || 0;

      if (!sku || !name) {
        skipped++;
        continue;
      }

      const customData: any = {};
      for (let j = 0; j < headers.length; j++) {
        if (j !== skuIdx && j !== nameIdx && j !== priceIdx) {
          const fieldLabel = headers[j];
          const matchedField = customFields.find((f) => f.label === fieldLabel);
          if (matchedField) {
            customData[matchedField.name] = parsedRow[j] || '';
          }
        }
      }

      try {
        await this.prisma.product.upsert({
          where: {
            organizationId_sku: {
              organizationId,
              sku,
            },
          },
          update: {
            name,
            basePrice,
            customData,
            tableId,
          },
          create: {
            organizationId,
            tableId,
            sku,
            name,
            basePrice,
            customData,
          },
        });
        imported.push(sku);
        spaceLeft--;
      } catch (err) {
        skipped++;
      }
    }

    return {
      success: true,
      importedCount: imported.length,
      skippedCount: skipped,
      totalCount: lines.length - 1,
    };
  }
}
