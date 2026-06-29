import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getPaginationParams, buildPaginatedResult } from '@atlas/utils';

@Injectable()
export class CrmService {
  constructor(@Inject('PRISMA_SERVICE') private readonly prisma: PrismaClient) { }

  async getCustomers(
    organizationId: string,
    query: { search?: string; page?: string; limit?: string }
  ) {
    const whereCondition: any = { organizationId };

    if (query.search) {
      whereCondition.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const { page, limit, skip } = getPaginationParams(query);

    const total = await this.prisma.customer.count({
      where: whereCondition
    });

    const data = await this.prisma.customer.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    return buildPaginatedResult(data, total, page, limit);
  }

  async getCustomer(organizationId: string, id: string) {
    return this.prisma.customer.findFirst({
      where: { id, organizationId }
    });
  }

  async createCustomer(organizationId: string, data: any) {
    return this.prisma.customer.create({
      data: {
        organizationId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        status: data.status || 'LEAD'
      }
    });
  }

  async updateCustomer(organizationId: string, id: string, data: any) {
    const exists = await this.getCustomer(organizationId, id);
    if (!exists) throw new Error('Customer not found or access denied');

    return this.prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        status: data.status
      }
    });
  }

  async deleteCustomer(organizationId: string, id: string) {
    const exists = await this.getCustomer(organizationId, id);
    if (!exists) throw new Error('Customer not found or access denied');

    return this.prisma.customer.delete({
      where: { id }
    });
  }

  async getDeals(organizationId: string) {
    return this.prisma.deal.findMany({
      where: { organizationId },
      include: {
        customer: true,
        lineItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDeal(organizationId: string, id: string) {
    return this.prisma.deal.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        lineItems: true
      }
    });
  }

  async createDeal(organizationId: string, data: any) {
    const lineItems = data.lineItems || [];
    const calculatedValue = lineItems.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);

    return this.prisma.deal.create({
      data: {
        organizationId,
        title: data.title,
        customerId: data.customerId,
        stage: data.stage || 'QUALIFICATION',
        value: calculatedValue,
        lineItems: {
          create: lineItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: {
        customer: true,
        lineItems: true
      }
    });
  }

  async updateDeal(organizationId: string, id: string, data: any, userId?: string) {
    const previousDeal = await this.prisma.deal.findFirst({
      where: { id, organizationId }
    });
    if (!previousDeal) throw new Error('Deal not found');

    const lineItems = data.lineItems || [];
    const calculatedValue = lineItems.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);

    // Delete existing line items first
    await this.prisma.dealItem.deleteMany({
      where: { dealId: id }
    });

    const updatedDeal = await this.prisma.deal.update({
      where: { id },
      data: {
        title: data.title,
        customerId: data.customerId,
        stage: data.stage,
        value: calculatedValue,
        lineItems: {
          create: lineItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: {
        customer: true,
        lineItems: true
      }
    });

    // If deal transitioned to CLOSED_WON, trigger stock deduction
    if (data.stage === 'CLOSED_WON' && previousDeal.stage !== 'CLOSED_WON') {
      await this.handleClosedWonDeal(organizationId, id, userId);
    }

    return updatedDeal;
  }

  async deleteDeal(organizationId: string, id: string) {
    const exists = await this.getDeal(organizationId, id);
    if (!exists) throw new Error('Deal not found or access denied');

    return this.prisma.deal.delete({
      where: { id }
    });
  }

  private async handleClosedWonDeal(organizationId: string, dealId: string, userId?: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id: dealId, organizationId },
      include: { lineItems: true }
    });
    if (!deal) throw new Error('Deal not found');

    let defaultWh = await this.prisma.warehouse.findFirst({
      where: { organizationId, name: 'Default Warehouse' }
    });
    if (!defaultWh) {
      defaultWh = await this.prisma.warehouse.create({
        data: {
          organizationId,
          name: 'Default Warehouse',
          location: 'Primary Storage',
        }
      });
    }

    for (const item of deal.lineItems) {
      const stockEntry = await this.prisma.stock.findUnique({
        where: { productId_warehouseId: { productId: item.productId, warehouseId: defaultWh.id } }
      });
      const currentQty = stockEntry ? stockEntry.quantity : 0;
      const nextQty = Math.max(0, currentQty - item.quantity);

      await this.prisma.stock.upsert({
        where: { productId_warehouseId: { productId: item.productId, warehouseId: defaultWh.id } },
        create: {
          organizationId,
          productId: item.productId,
          warehouseId: defaultWh.id,
          quantity: nextQty
        },
        update: {
          quantity: nextQty
        }
      });

      await this.prisma.stockTransaction.create({
        data: {
          organizationId,
          productId: item.productId,
          warehouseId: defaultWh.id,
          type: 'ISSUE',
          quantity: -item.quantity,
          reference: `Sales Deal Won: ${deal.title} (Ref: ${deal.id})`,
          userId
        }
      });
    }
  }
}
