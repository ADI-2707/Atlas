import { AtlasPlugin } from '@atlas/plugin-sdk';
import { CrmController } from './controllers/crm.controller';
import { CrmService } from './services/crm.service';

const manifest = {
  id: 'crm',
  name: 'CRM Management',
  version: '1.0.0',
  author: 'Atlas Team',
  description: 'Enterprise CRM management plugin.',
  atlasVersion: '1.0.0',
  dependencies: [],
  permissions: ['crm.read', 'crm.write'],
  events: [],
  routes: ['/crm/customers'],
  widgets: [],
};

const config = AtlasPlugin({
  manifest,
  controllers: [CrmController],
  providers: [CrmService],
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
