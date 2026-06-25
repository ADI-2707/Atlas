import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateUserDto, organizationId: string, callerId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email address is already in use');
    }

    if (dto.roleIds && dto.roleIds.length > 0) {
      const validRolesCount = await this.prisma.role.count({
        where: {
          id: { in: dto.roleIds },
          organizationId,
        },
      });
      if (validRolesCount !== dto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid for this organization');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        organizationId,
        status: 'ACTIVE',
        roles: dto.roleIds ? {
          connect: dto.roleIds.map((id) => ({ id })),
        } : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.auditService.createLog({
      userId: callerId,
      organizationId,
      action: 'user.create',
      result: 'SUCCESS',
      details: { targetUserId: user.id, email: user.email },
    });

    return user;
  }

  async findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto, organizationId: string, callerId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.roleIds) {
      const validRolesCount = await this.prisma.role.count({
        where: {
          id: { in: dto.roleIds },
          organizationId,
        },
      });
      if (validRolesCount !== dto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid for this organization');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: dto.status,
        roles: dto.roleIds ? {
          set: dto.roleIds.map((id) => ({ id })),
        } : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.auditService.createLog({
      userId: callerId,
      organizationId,
      action: 'user.update',
      result: 'SUCCESS',
      details: { targetUserId: id },
    });

    return updatedUser;
  }

  async remove(id: string, organizationId: string, callerId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (id === callerId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    await this.auditService.createLog({
      userId: callerId,
      organizationId,
      action: 'user.delete',
      result: 'SUCCESS',
      details: { targetUserId: id },
    });

    return { message: 'User deleted successfully' };
  }
}
