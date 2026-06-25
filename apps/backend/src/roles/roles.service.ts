import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateRoleDto, organizationId: string, callerId: string) {
    const existing = await this.prisma.role.findFirst({
      where: { name: dto.name, organizationId },
    });
    if (existing) {
      throw new ConflictException('A role with this name already exists');
    }

    const validPermissionsCount = await this.prisma.permission.count({
      where: { id: { in: dto.permissionIds } },
    });
    if (validPermissionsCount !== dto.permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        organizationId,
        isSystem: false,
        permissions: {
          connect: dto.permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });

    await this.auditService.createLog({
      userId: callerId,
      organizationId,
      action: 'role.create',
      result: 'SUCCESS',
      details: { roleId: role.id, name: role.name },
    });

    return role;
  }

  async findAll(organizationId: string) {
    return this.prisma.role.findMany({
      where: { organizationId },
      include: {
        permissions: {
          select: {
            id: true,
            code: true,
            name: true,
            module: true,
          },
        },
      },
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        module: true,
      },
      orderBy: { module: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, organizationId },
      include: {
        permissions: {
          select: {
            id: true,
            code: true,
            name: true,
            module: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto, organizationId: string, callerId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, organizationId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be modified');
    }

    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findFirst({
        where: { name: dto.name, organizationId },
      });
      if (existing) {
        throw new ConflictException('A role with this name already exists');
      }
    }

    if (dto.permissionIds) {
      const validPermissionsCount = await this.prisma.permission.count({
        where: { id: { in: dto.permissionIds } },
      });
      if (validPermissionsCount !== dto.permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds ? {
          set: dto.permissionIds.map((id) => ({ id })),
        } : undefined,
      },
      include: {
        permissions: true,
      },
    });

    await this.auditService.createLog({
      userId: callerId,
      organizationId,
      action: 'role.update',
      result: 'SUCCESS',
      details: { roleId: id },
    });

    return updatedRole;
  }

  async remove(id: string, organizationId: string, callerId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, organizationId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    await this.prisma.role.delete({
      where: { id },
    });

    await this.auditService.createLog({
      userId: callerId,
      organizationId,
      action: 'role.delete',
      result: 'SUCCESS',
      details: { roleId: id },
    });

    return { message: 'Role deleted successfully' };
  }
}
