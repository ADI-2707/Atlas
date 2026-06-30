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

  async createCustomer(organizationId: string, data: any, userId?: string) {
    const stats = await this.getLimitStats(organizationId);
    if (stats.limits.customers !== -1) {
      if (stats.usage.customers / stats.limits.customers >= 0.995) {
        throw new BadRequestException(`Critical limit reached (>=99.5%). Upgrade your subscription plan to modify or add CRM contacts.`);
      }
      if (stats.usage.customers >= stats.limits.customers) {
        throw new BadRequestException(`Customer limit reached for your current tier (${stats.tier}). Please upgrade to add more.`);
      }
    }

    const customer = await this.prisma.customer.create({
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

    await this.logAction(organizationId, 'crm.contact.created', 'SUCCESS', { contactId: customer.id, name: customer.name, email: customer.email }, userId);
    return customer;
  }

  async updateCustomer(organizationId: string, id: string, data: any, userId?: string) {
    const exists = await this.getCustomer(organizationId, id);
    if (!exists) throw new Error('Customer not found or access denied');

    const stats = await this.getLimitStats(organizationId);
    if (stats.limits.customers !== -1 && stats.usage.customers / stats.limits.customers >= 0.995) {
      throw new BadRequestException(`Critical limit reached (>=99.5%). Upgrade your subscription plan to modify or add CRM contacts.`);
    }

    const customer = await this.prisma.customer.update({
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

    await this.logAction(organizationId, 'crm.contact.updated', 'SUCCESS', { contactId: customer.id, name: customer.name, status: customer.status }, userId);
    return customer;
  }

  async deleteCustomer(organizationId: string, id: string, userId?: string) {
    const exists = await this.getCustomer(organizationId, id);
    if (!exists) throw new Error('Customer not found or access denied');

    const customer = await this.prisma.customer.delete({
      where: { id }
    });

    await this.logAction(organizationId, 'crm.contact.deleted', 'SUCCESS', { contactId: id, name: exists.name }, userId);
    return customer;
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

  async createDeal(organizationId: string, data: any, userId?: string) {
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

    const deal = await this.prisma.deal.create({
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

    await this.logAction(organizationId, 'crm.deal.created', 'SUCCESS', { dealId: deal.id, title: deal.title, stage: deal.stage, value: deal.value }, userId);
    return deal;
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

    if (data.stage === 'CLOSED_WON' && previousDeal.stage !== 'CLOSED_WON') {
      await this.publishClosedWonDealEvent(organizationId, updatedDeal, userId);
    }

    await this.logAction(organizationId, 'crm.deal.updated', 'SUCCESS', { dealId: updatedDeal.id, title: updatedDeal.title, stage: updatedDeal.stage, value: updatedDeal.value, previousStage: previousDeal.stage }, userId);
    return updatedDeal;
  }

  async deleteDeal(organizationId: string, id: string, userId?: string) {
    const exists = await this.getDeal(organizationId, id);
    if (!exists) throw new Error('Deal not found or access denied');

    const deal = await this.prisma.deal.delete({
      where: { id }
    });

    await this.logAction(organizationId, 'crm.deal.deleted', 'SUCCESS', { dealId: id, title: exists.title }, userId);
    return deal;
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

  async exportCustomersCsv(organizationId: string) {
    const schema = await this.getContactSchema();
    const customers = await this.prisma.customer.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', ...schema.map((f: any) => f.label)];
    const rows = customers.map((c: any) => {
      const row = [
        c.name,
        c.email,
        c.phone || '',
        c.company || '',
        c.status,
        ...schema.map((f: any) => (c.customData as any)?.[f.name] || '')
      ];
      return row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    return { csv: csvContent };
  }

  async importCustomersCsv(organizationId: string, csvContent: string) {
    const schema = await this.getContactSchema();
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) throw new BadRequestException('CSV is empty or invalid');

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
    const nameIdx = headers.indexOf('Name');
    const emailIdx = headers.indexOf('Email');
    const phoneIdx = headers.indexOf('Phone');
    const companyIdx = headers.indexOf('Company');
    const statusIdx = headers.indexOf('Status');

    if (nameIdx === -1 || emailIdx === -1) {
      throw new BadRequestException('CSV must contain Name and Email columns');
    }

    const imported = [];
    let skipped = 0;

    const stats = await this.getLimitStats(organizationId);
    let spaceLeft = stats.limits.customers === -1 ? 999999 : (stats.limits.customers - stats.usage.customers);

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

      const name = parsedRow[nameIdx];
      const email = parsedRow[emailIdx];
      const phone = phoneIdx !== -1 ? parsedRow[phoneIdx] : '';
      const company = companyIdx !== -1 ? parsedRow[companyIdx] : '';
      const status = statusIdx !== -1 ? parsedRow[statusIdx] : 'LEAD';

      if (!name || !email) {
        skipped++;
        continue;
      }

      const customData: any = {};
      for (let j = 0; j < headers.length; j++) {
        if (j !== nameIdx && j !== emailIdx && j !== phoneIdx && j !== companyIdx && j !== statusIdx) {
          const fieldLabel = headers[j];
          const matchedField = schema.find((f: any) => f.label === fieldLabel);
          if (matchedField) {
            customData[matchedField.name] = matchedField.type === 'number' ? (parseFloat(parsedRow[j]) || 0) : (parsedRow[j] || '');
          }
        }
      }

      try {
        await this.prisma.customer.upsert({
          where: {
            organizationId_email: {
              organizationId,
              email,
            },
          },
          update: {
            name,
            phone: phone || null,
            company: company || null,
            status: status || 'LEAD',
            customData,
          },
          create: {
            organizationId,
            name,
            email,
            phone: phone || null,
            company: company || null,
            status: status || 'LEAD',
            customData,
          },
        });
        imported.push(email);
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

  async getCrmAuditLogs(organizationId: string, query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = getPaginationParams(query);
    const whereCondition: any = { organizationId, pluginId: 'crm' };

    if (query.search) {
      whereCondition.action = { contains: query.search, mode: 'insensitive' };
    }

    const total = await this.prisma.auditLog.count({ where: whereCondition });
    const data = await this.prisma.auditLog.findMany({
      where: whereCondition,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return buildPaginatedResult(data, total, page, limit);
  }

  private async logAction(
    organizationId: string,
    action: string,
    result: string,
    details: any,
    userId?: string
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId,
          pluginId: 'crm',
          action,
          result,
          userId: userId || null,
          details: details || {},
        }
      });
    } catch (err) {
      console.error('Failed to write CRM audit log:', err);
    }
  }
}
