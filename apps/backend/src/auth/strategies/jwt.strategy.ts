import { Injectable, UnauthorizedException, OnModuleDestroy } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { configManager } from '@atlas/config';
import { getRedisConfig } from '@atlas/utils';
import Redis from 'ioredis';

const SESSION_CACHE_PREFIX = 'session:';
const SESSION_CACHE_MAX_TTL_SECONDS = 300; // 5 minutes max cache TTL

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements OnModuleDestroy {
  private readonly redis: Redis;

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

    const redisConfig = getRedisConfig();
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      enableReadyCheck: false,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    // Non-fatal: if Redis is unavailable, JwtStrategy falls back to DB queries
    this.redis.on('error', () => {});
  }

  async onModuleDestroy() {
    await this.redis.quit().catch(() => {});
  }

  /**
   * Deletes the session cache entry on logout or revocation.
   * Call this from AuthService.logout() after deleting the DB session.
   */
  async invalidateSessionCache(sessionId: string): Promise<void> {
    await this.redis.del(`${SESSION_CACHE_PREFIX}${sessionId}`).catch(() => {});
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

    const cacheKey = `${SESSION_CACHE_PREFIX}${payload.sessionId}`;

    // ── Cache read ──────────────────────────────────────────────────────────
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Redis unavailable — fall through to DB
    }

    // ── DB fallback ─────────────────────────────────────────────────────────
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

    // Fire-and-forget: update lastActivity without blocking the request
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

    const userContext = {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      organizationId: session.user.organizationId,
      roles: session.user.roles.map((r: any) => r.name),
      permissions: Array.from(permissions),
      sessionId: session.id,
    };

    // ── Cache write ─────────────────────────────────────────────────────────
    try {
      const secondsUntilExpiry = Math.floor(
        (new Date(session.expiresAt).getTime() - Date.now()) / 1000,
      );
      const ttl = Math.min(SESSION_CACHE_MAX_TTL_SECONDS, Math.max(60, secondsUntilExpiry));
      await this.redis.set(cacheKey, JSON.stringify(userContext), 'EX', ttl);
    } catch {
      // Redis write failure is non-fatal
    }

    return userContext;
  }
}
