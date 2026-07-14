import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: InviteUserDto, organizationId: string, callerId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email address is already in use by a registered user');
    }

    const existingInvite = await this.prisma.invitation.findFirst({
      where: {
        email: dto.email,
        organizationId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvite) {
      throw new ConflictException('An active invitation has already been sent to this email address');
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

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email,
        token,
        organizationId,
        roleIds: dto.roleIds || [],
        expiresAt,
        status: 'PENDING',
      },
    });

    await this.auditService.createLog({
      userId: callerId,
      organizationId,
      action: 'user.invite',
      result: 'SUCCESS',
      details: { email: dto.email, invitationId: invitation.id },
    });

    console.log(`\n--- INVITATION CREATED ---`);
    console.log(`To: ${dto.email}`);
    console.log(`Onboarding URL: http://localhost:5173/accept-invite?token=${token}`);
    console.log(`--------------------------\n`);

    return {
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };
  }

  async findAll(organizationId: string) {
    return this.prisma.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        roleIds: true,
      },
    });
  }

  async revoke(id: string, organizationId: string, callerId: string) {
    const invite = await this.prisma.invitation.findFirst({
      where: { id, organizationId },
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    await this.auditService.createLog({
      userId: callerId,
      organizationId,
      action: 'user.invite_revoke',
      result: 'SUCCESS',
      details: { email: invite.email, invitationId: id },
    });

    return { message: 'Invitation revoked successfully' };
  }
}
