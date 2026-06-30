import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string) {
    
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: dto.orgSlug },
    });
    if (existingOrg) {
      throw new ConflictException('Organization slug is already in use');
    }

    
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email address is already in use');
    }

    
    const result = await this.prisma.$transaction(async (tx: any) => {
      
      const org = await tx.organization.create({
        data: {
          name: dto.orgName,
          slug: dto.orgSlug,
          status: 'ACTIVE',
        },
      });

      
      const allPermissions = await tx.permission.findMany();

      
      const superAdminRole = await tx.role.create({
        data: {
          name: 'Super Admin',
          description: 'Organization super administrator',
          isSystem: true,
          organizationId: org.id,
          permissions: {
            connect: allPermissions.map((p: any) => ({ id: p.id })),
          },
        },
      });

      
      const orgAdminRole = await tx.role.create({
        data: {
          name: 'Org Admin',
          description: 'Organization administrator',
          isSystem: true,
          organizationId: org.id,
          permissions: {
            connect: allPermissions
              .filter((p: any) => p.code !== 'platform.configure' && p.code !== 'plugins.write')
              .map((p: any) => ({ id: p.id })),
          },
        },
      });

      
      await tx.role.create({
        data: {
          name: 'User',
          description: 'Standard organization user',
          isSystem: true,
          organizationId: org.id,
          permissions: {
            connect: allPermissions
              .filter((p: any) => p.code.endsWith('.read'))
              .map((p: any) => ({ id: p.id })),
          },
        },
      });

      
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          status: 'ACTIVE',
          organizationId: org.id,
          roles: {
            connect: [{ id: superAdminRole.id }, { id: orgAdminRole.id }],
          },
        },
        include: {
          roles: true,
        },
      });

      return { org, user };
    });

    
    await this.auditService.createLog({
      userId: result.user.id,
      organizationId: result.org.id,
      action: 'auth.register',
      result: 'SUCCESS',
      ipAddress,
      details: { email: dto.email, orgSlug: dto.orgSlug },
    });

    return {
      message: 'Organization and administrator registered successfully',
      data: {
        organization: {
          id: result.org.id,
          name: result.org.name,
          slug: result.org.slug,
        },
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
      },
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        roles: true,
      },
    });

    
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      await this.auditService.createLog({
        action: 'auth.login',
        result: 'FAILURE',
        ipAddress,
        details: { email: dto.email, reason: 'Invalid credentials' },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      await this.auditService.createLog({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'auth.login',
        result: 'FAILURE',
        ipAddress,
        details: { email: dto.email, reason: 'User account is inactive' },
      });
      throw new UnauthorizedException('Your account is deactivated');
    }

    
    const sessionId = randomUUID();
    const payload = {
      email: user.email,
      sub: user.id,
      orgId: user.organizationId,
      roles: user.roles.map((r: any) => r.name),
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    });
    const refreshToken = randomUUID();

    
    
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    
    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt: refreshExpiry,
      },
    });

    await this.auditService.createLog({
      userId: user.id,
      organizationId: user.organizationId,
      action: 'auth.login',
      result: 'SUCCESS',
      ipAddress,
      sessionId,
    });

    return {
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
          roles: user.roles.map((r: any) => r.name),
          hasCompletedSetup: user.hasCompletedSetup,
        },
      },
    };
  }

  async refresh(dto: RefreshDto, ipAddress?: string, userAgent?: string) {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken: dto.refreshToken },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is deactivated');
    }

    
    const newRefreshToken = randomUUID();
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    const payload = {
      email: session.user.email,
      sub: session.user.id,
      orgId: session.user.organizationId,
      roles: session.user.roles.map((r: any) => r.name),
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    });

    
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: refreshExpiry,
        ipAddress,
        userAgent,
        lastActivity: new Date(),
      },
    });

    return {
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  async logout(sessionId: string, userId: string, orgId: string, ipAddress?: string) {
    try {
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
    } catch (e) {
      
    }

    await this.auditService.createLog({
      userId,
      organizationId: orgId,
      action: 'auth.logout',
      result: 'SUCCESS',
      ipAddress,
      sessionId,
    });

    return {
      message: 'Logged out successfully',
      data: null,
    };
  }

  async completeSetup(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hasCompletedSetup: true },
    });
    return { message: 'Setup completed', data: null };
  }
}

