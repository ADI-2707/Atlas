import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { configManager } from '@atlas/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const secret = configManager.has('JWT_SECRET') ? configManager.get<string>('JWT_SECRET') : null;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing or empty in production!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'atlas-dev-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    // Super Admins don't have database sessions, validate statelessly
    if (payload?.roles?.includes('SYSTEM_ADMIN')) {
      return {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
        organizationId: null,
      };
    }

    if (!payload || !payload.sessionId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          include: {
            roles: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or revoked');
    }

    if (new Date(session.expiresAt) < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    if (session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is inactive');
    }

    
    this.prisma.session.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    }).catch((err: any) => console.error('Failed to update session activity:', err));

    
    const permissions = new Set<string>();
    for (const role of session.user.roles) {
      for (const perm of role.permissions) {
        permissions.add(perm.code);
      }
    }

    return {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      organizationId: session.user.organizationId,
      roles: session.user.roles.map((r: any) => r.name),
      permissions: Array.from(permissions),
      sessionId: session.id,
    };
  }
}
