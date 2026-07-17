import { AtlasPlugin } from '@atlas/plugin-sdk';
import { ProjectManagementController } from './controllers/project-management.controller';
import { ProjectManagementService } from './services/project-management.service';
import manifest from '../../manifest.json';

import { PmPrismaService } from './prisma/pm-prisma.service';

export default AtlasPlugin({
  manifest,
  controllers: [ProjectManagementController],
  providers: [ProjectManagementService, PmPrismaService],
  permissions: [
    { code: 'pm.read',   name: 'Read Projects',   description: 'View projects and issues' },
    { code: 'pm.create', name: 'Create Projects',  description: 'Create new projects and issues' },
    { code: 'pm.update', name: 'Update Projects',  description: 'Edit projects and issues' },
    { code: 'pm.delete', name: 'Delete Projects',  description: 'Delete projects and issues' },
  ],
  lifecycle: {
    onInstall: async () => { console.log('PM plugin onInstall triggered'); },
    onEnable:  async () => { console.log('PM plugin onEnable triggered'); },
    onDisable: async () => { console.log('PM plugin onDisable triggered'); },
  },
});
