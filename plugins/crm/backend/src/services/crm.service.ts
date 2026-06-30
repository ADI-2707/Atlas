import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getPaginationParams, buildPaginatedResult } from '@atlas/utils';
import { eventBus } from '@atlas/events';

@Injectable()
export class CrmService {
  constructor(@Inject('PRISMA_SERVICE') private readonly prisma: PrismaClient) { }

  private readonly tierLimits: Record<string, { customers: number; deals: number }> = {
    free: { customers: 50, deals: 20 },
    tier1: { customers: 200, deals: 100 },
    tier2: { customers: 1000, deals: 500 },
    tier3: { customers: -1, deals: -1 },
  };

  private getNormalizedTier(tier?: string) {
    return tier && this.tierLimits[tier] ? tier : 'free';
  }

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

  async getLimitStats(organizationId: string) {
    const plugin = await this.prisma.plugin.findFirst({
      where: { id: 'crm' }
    });
    const tier = this.getNormalizedTier((plugin?.config as any)?.tier);

    const [
      customersCount,
      dealsCount,
      leadCount,
      prospectCount,
      customerCount,
      churnedCount,
      qualificationCount,
      proposalCount,
      negotiationCount,
      closedWonCount,
      closedLostCount,
      pipelineValue,
      closedWonValue,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { organizationId } }),
      this.prisma.deal.count({ where: { organizationId } }),
      this.prisma.customer.count({ where: { organizationId, status: 'LEAD' } }),
      this.prisma.customer.count({ where: { organizationId, status: 'PROSPECT' } }),
      this.prisma.customer.count({ where: { organizationId, status: 'CUSTOMER' } }),
      this.prisma.customer.count({ where: { organizationId, status: 'CHURNED' } }),
      this.prisma.deal.count({ where: { organizationId, stage: 'QUALIFICATION' } }),
      this.prisma.deal.count({ where: { organizationId, stage: 'PROPOSAL' } }),
      this.prisma.deal.count({ where: { organizationId, stage: 'NEGOTIATION' } }),
      this.prisma.deal.count({ where: { organizationId, stage: 'CLOSED_WON' } }),
      this.prisma.deal.count({ where: { organizationId, stage: 'CLOSED_LOST' } }),
      this.prisma.deal.aggregate({
        where: { organizationId },
        _sum: { value: true },
      }),
      this.prisma.deal.aggregate({
        where: { organizationId, stage: 'CLOSED_WON' },
        _sum: { value: true },
      }),
    ]);

    const currentLimits = this.tierLimits[tier];

    return {
      tier,
      usage: {
        customers: customersCount,
        deals: dealsCount,
        customerStatuses: {
          lead: leadCount,
          prospect: prospectCount,
          customer: customerCount,
          churned: churnedCount,
        },
        dealStages: {
          qualification: qualificationCount,
          proposal: proposalCount,
          negotiation: negotiationCount,
          closedWon: closedWonCount,
          closedLost: closedLostCount,
        },
        pipelineValue: pipelineValue._sum.value || 0,
        closedWonValue: closedWonValue._sum.value || 0,
      },
      limits: currentLimits,
    };
  }

  async createCustomer(organizationId: string, data: any) {
    const stats = await this.getLimitStats(organizationId);
    if (stats.limits.customers !== -1) {
      if (stats.usage.customers / stats.limits.customers >= 0.995) {
        throw new BadRequestException(`Critical limit reached (>=99.5%). Upgrade your subscription plan to modify or add CRM contacts.`);
      }
      if (stats.usage.customers >= stats.limits.customers) {
        throw new BadRequestException(`Customer limit reached for your current tier (${stats.tier}). Please upgrade to add more.`);
      }
    }

    return this.prisma.customer.create({
      data: {
        organizationId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        status: data.status || 'LEAD',
        customData: data.customData || {},
      }
    });
  }

  async updateCustomer(organizationId: string, id: string, data: any) {
    const exists = await this.getCustomer(organizationId, id);
    if (!exists) throw new Error('Customer not found or access denied');

    const stats = await this.getLimitStats(organizationId);
    if (stats.limits.customers !== -1 && stats.usage.customers / stats.limits.customers >= 0.995) {
      throw new BadRequestException(`Critical limit reached (>=99.5%). Upgrade your subscription plan to modify or add CRM contacts.`);
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        status: data.status,
        customData: data.customData || {},
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
    const stats = await this.getLimitStats(organizationId);
    if (stats.limits.deals !== -1) {
      if (stats.usage.deals / stats.limits.deals >= 0.995) {
        throw new BadRequestException(`Critical limit reached (>=99.5%). Upgrade your subscription plan to modify or add CRM deals.`);
      }
      if (stats.usage.deals >= stats.limits.deals) {
        throw new BadRequestException(`Deal limit reached for your current tier (${stats.tier}). Please upgrade to add more.`);
      }
    }

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

    const stats = await this.getLimitStats(organizationId);
    if (stats.limits.deals !== -1 && stats.usage.deals / stats.limits.deals >= 0.995) {
      throw new BadRequestException(`Critical limit reached (>=99.5%). Upgrade your subscription plan to modify or add CRM deals.`);
    }

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

    // If deal transitioned to CLOSED_WON, publish an event for interested plugins.
    if (data.stage === 'CLOSED_WON' && previousDeal.stage !== 'CLOSED_WON') {
      await this.publishClosedWonDealEvent(organizationId, updatedDeal, userId);
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

  private async publishClosedWonDealEvent(organizationId: string, deal: any, userId?: string) {
    await eventBus.publish({
      eventType: 'crm.deal.closed_won',
      organizationId,
      plugin: 'crm',
      payload: {
        dealId: deal.id,
        dealTitle: deal.title,
        userId,
        lineItems: deal.lineItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    });
  }

  async getContactSchema() {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id: 'crm' }
    });
    const config = (plugin?.config as any) || {};
    return config.contactFields || [];
  }

  async updateContactSchema(fieldSchema: any) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id: 'crm' }
    });
    const config = (plugin?.config as any) || {};
    const updatedConfig = { ...config, contactFields: fieldSchema };

    await this.prisma.plugin.update({
      where: { id: 'crm' },
      data: { config: updatedConfig }
    });
    return fieldSchema;
  }
}
