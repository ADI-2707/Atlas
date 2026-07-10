import { AtlasPlugin } from '@atlas/plugin-sdk';
import { ProjectManagementController } from './controllers/project-management.controller';
import { ProjectManagementService } from './services/project-management.service';
import manifest from '../../manifest.json';

import { PmPrismaService } from './prisma/pm-prisma.service';

export default AtlasPlugin({
  manifest,
  controllers: [ProjectManagementController],
  providers: [ProjectManagementService, PmPrismaService],
});
