import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const totalOrgs = await this.prisma.organization.count();
    
    // Calculate plugin usage by counting the unique plugins installed across orgs (mock logic)
    const plugins = await this.prisma.plugin.findMany();
    
    return {
      totalOrganizations: totalOrgs,
      activeSubscriptions: totalOrgs, // 1 sub per org for now
      monthlyRecurringRevenue: totalOrgs * 99, // Mock $99 per org
      pluginUsage: plugins.map(p => ({
        pluginId: p.id,
        name: p.name,
        installs: Math.floor(Math.random() * totalOrgs) // Mocked distribution
      }))
    };
  }
}
