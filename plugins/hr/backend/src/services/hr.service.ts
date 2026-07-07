import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getPaginationParams, buildPaginatedResult } from '@atlas/utils';

@Injectable()
export class HrService {
  constructor(@Inject('PRISMA_SERVICE') private readonly prisma: PrismaClient) {}

  private readonly tierLimits: Record<string, { employees: number; departments: number }> = {
    free: { employees: 10, departments: 1 },
    tier1: { employees: 50, departments: -1 },
    tier2: { employees: 250, departments: -1 },
    tier3: { employees: -1, departments: -1 },
  };

  private getNormalizedTier(tier?: string) {
    return tier && this.tierLimits[tier] ? tier : 'free';
  }

  async getLimitStats(organizationId: string) {
    const plugin = await this.prisma.plugin.findFirst({
      where: { id: 'hr' }
    });
    const tier = this.getNormalizedTier((plugin?.config as any)?.tier);

    const [
      employeesCount,
      departmentsCount
    ] = await Promise.all([
      this.prisma.employee.count({ where: { organizationId } }),
      this.prisma.department.count({ where: { organizationId } })
    ]);

    const currentLimits = this.tierLimits[tier];

    return {
      tier,
      usage: {
        employees: employeesCount,
        departments: departmentsCount,
      },
      limits: currentLimits,
    };
  }

  async getAuditLogs(organizationId: string, query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = getPaginationParams(query);
    const whereCondition: any = { organizationId, pluginId: 'hr' };

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

  async getEmployees(organizationId: string, query: { search?: string; page?: string; limit?: string }) {
    const whereCondition: any = { organizationId };

    if (query.search) {
      whereCondition.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { employeeCode: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const { page, limit, skip } = getPaginationParams(query);

    const total = await this.prisma.employee.count({ where: whereCondition });
    const data = await this.prisma.employee.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { department: true }
    });

    return buildPaginatedResult(data, total, page, limit);
  }

  async getEmployee(organizationId: string, id: string) {
    return this.prisma.employee.findFirst({
      where: { id, organizationId },
      include: { department: true }
    });
  }

  async createEmployee(organizationId: string, data: any, userId?: string) {
    const stats = await this.getLimitStats(organizationId);
    if (stats.limits.employees !== -1) {
      if (stats.usage.employees / stats.limits.employees >= 0.995) {
        throw new BadRequestException(`Critical limit reached (>=99.5%). Upgrade your subscription plan to modify or add HR employees.`);
      }
      if (stats.usage.employees >= stats.limits.employees) {
        throw new BadRequestException(`Employee limit reached for your current tier (${stats.tier}). Please upgrade to add more.`);
      }
    }

    const employee = await this.prisma.employee.create({
      data: {
        organizationId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        employeeCode: data.employeeCode,
        phone: data.phone || null,
        jobTitle: data.jobTitle || null,
        departmentId: data.departmentId || null,
        managerId: data.managerId || null,
        employmentType: data.employmentType || 'FULL_TIME',
        status: data.status || 'ACTIVE',
        hireDate: new Date(data.hireDate),
        customData: data.customData || {},
      }
    });

    await this.logAction(organizationId, 'hr.employee.created', 'SUCCESS', { employeeId: employee.id, email: employee.email }, userId);
    return employee;
  }

  async updateEmployee(organizationId: string, id: string, data: any, userId?: string) {
    const exists = await this.getEmployee(organizationId, id);
    if (!exists) throw new Error('Employee not found or access denied');

    const stats = await this.getLimitStats(organizationId);
    if (stats.limits.employees !== -1 && stats.usage.employees / stats.limits.employees >= 0.995) {
      throw new BadRequestException(`Critical limit reached (>=99.5%). Upgrade your subscription plan to modify or add HR employees.`);
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        employeeCode: data.employeeCode,
        phone: data.phone,
        jobTitle: data.jobTitle,
        departmentId: data.departmentId,
        managerId: data.managerId,
        employmentType: data.employmentType,
        status: data.status,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
        customData: data.customData || {},
      }
    });

    await this.logAction(organizationId, 'hr.employee.updated', 'SUCCESS', { employeeId: employee.id, status: employee.status }, userId);
    return employee;
  }

  async deleteEmployee(organizationId: string, id: string, userId?: string) {
    const exists = await this.getEmployee(organizationId, id);
    if (!exists) throw new Error('Employee not found or access denied');

    const employee = await this.prisma.employee.delete({
      where: { id }
    });

    await this.logAction(organizationId, 'hr.employee.deleted', 'SUCCESS', { employeeId: id, email: exists.email }, userId);
    return employee;
  }

  async getPayrollRecords(organizationId: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip } = getPaginationParams(query);
    const whereCondition = { organizationId };

    const total = await this.prisma.payrollRecord.count({ where: whereCondition });
    const data = await this.prisma.payrollRecord.findMany({
      where: whereCondition,
      orderBy: { periodStart: 'desc' },
      skip,
      take: limit,
      include: { employee: true }
    });

    return buildPaginatedResult(data, total, page, limit);
  }

  async createPayrollRecord(organizationId: string, data: any, userId?: string) {
    const record = await this.prisma.payrollRecord.create({
      data: {
        organizationId,
        employeeId: data.employeeId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        grossPay: data.grossPay,
        deductions: data.deductions || 0,
        netPay: data.netPay,
        status: data.status || 'DRAFT'
      }
    });

    await this.logAction(organizationId, 'hr.payroll.created', 'SUCCESS', { payrollId: record.id, employeeId: record.employeeId }, userId);
    return record;
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
          pluginId: 'hr',
          action,
          result,
          userId: userId || null,
          details: details || {},
        }
      });
    } catch (err) {
      console.error('Failed to write HR audit log:', err);
    }
  }
}
