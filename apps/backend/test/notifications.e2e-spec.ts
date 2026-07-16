import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Notifications & Onboarding Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminUserId: string;
  let orgId: string;
  let testInviteToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Get default seed admin
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@atlas.com' },
      include: { organization: true },
    });

    if (admin) {
      adminUserId = admin.id;
      orgId = admin.organizationId;
    } else {
      throw new Error('Default admin not found, run db:seed first');
    }

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@atlas.com',
        password: 'password123',
      })
      .expect(201);

    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up created test invitations and notifications
    await prisma.notification.deleteMany({
      where: { userId: adminUserId },
    });
    await prisma.invitation.deleteMany({
      where: { email: 'new_employee@test.com' },
    });
    await prisma.user.deleteMany({
      where: { email: 'new_employee@test.com' },
    });

    await app.close();
  });

  describe('REST Endpoints', () => {
    let testNotificationId: string;

    beforeEach(async () => {
      // Create a test notification for the admin
      const notif = await prisma.notification.create({
        data: {
          userId: adminUserId,
          title: 'Test Notification',
          message: 'This is a test notification message.',
          type: 'INFO',
        },
      });
      testNotificationId = notif.id;
    });

    afterEach(async () => {
      await prisma.notification.deleteMany({
        where: { userId: adminUserId },
      });
    });

    it('GET /notifications - fetch all for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].title).toBe('Test Notification');
    });

    it('PATCH /notifications/:id/read - mark notification as read', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/notifications/${testNotificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
    });

    it('PATCH /notifications/read-all - mark all read', async () => {
      const res = await request(app.getHttpServer())
        .patch('/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(typeof res.body.count).toBe('number');
    });

    it('DELETE /notifications/:id - remove notification', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/notifications/${testNotificationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const check = await prisma.notification.findUnique({
        where: { id: testNotificationId },
      });
      expect(check).toBeNull();
    });
  });

  describe('Workflow Integration: Employee Invitation Onboarding Trigger', () => {
    it('should create an invite and log notification for admins upon acceptance', async () => {
      // 1. Send invitation
      const inviteRes = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'new_employee@test.com',
          roleIds: [],
        })
        .expect(201);

      expect(inviteRes.body.email).toBe('new_employee@test.com');

      const invitation = await prisma.invitation.findUnique({
        where: { email_organizationId: { email: 'new_employee@test.com', organizationId: orgId } },
      });
      expect(invitation).toBeDefined();
      testInviteToken = invitation!.token;

      // 2. Accept invitation (which registers new user and triggers admin notification)
      await request(app.getHttpServer())
        .post('/auth/invitation/accept')
        .send({
          token: testInviteToken,
          firstName: 'New',
          lastName: 'Employee',
          password: 'securePassword123',
        })
        .expect(201);

      // 3. Verify notification was created for organization admins
      const notifications = await prisma.notification.findMany({
        where: {
          userId: adminUserId,
          title: 'Team Member Onboarded',
        },
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].message).toContain('New Employee');
    });
  });
});
