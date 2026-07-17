import { AtlasPlugin } from '@atlas/plugin-sdk';
import { CrmController } from './controllers/crm.controller';
import { CrmService } from './services/crm.service';
import { CrmPrismaService } from './prisma/crm-prisma.service';
import manifest from '../../manifest.json';

const config = AtlasPlugin({
  manifest,
  controllers: [CrmController],
  providers: [CrmService, CrmPrismaService],
  permissions: [
    {
      code: 'crm.read',
      name: 'Read CRM',
      description: 'Allows viewing customers',
    },
    {
      code: 'crm.write',
      name: 'Manage CRM',
      description: 'Allows editing customers',
    },
  ],
  lifecycle: {
    onInstall: async () => {
      console.log('CRM plugin onInstall triggered');
    },
    onEnable: async () => {
      console.log('CRM plugin onEnable triggered');
    },
    onDisable: async () => {
      console.log('CRM plugin onDisable triggered');
    },
  },
});

export default config;
