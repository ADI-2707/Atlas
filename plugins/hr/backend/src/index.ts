import { AtlasPlugin } from '@atlas/plugin-sdk';
import { HrController } from './controllers/hr.controller';
import { HrService } from './services/hr.service';

const manifest = {
  id: 'hr',
  name: 'HR Management',
  version: '1.0.0',
  author: 'Atlas Team',
  description: 'Enterprise HR management plugin.',
  atlasVersion: '1.0.0',
  dependencies: [],
  permissions: ['hr.read', 'hr.create', 'hr.update', 'hr.delete', 'hr.payroll.read', 'hr.payroll.write'],
  events: [],
  routes: ['/hr/employees', '/hr/payroll'],
  widgets: [],
};

const config = AtlasPlugin({
  manifest,
  controllers: [HrController],
  providers: [HrService],
  permissions: [
    { code: 'hr.read', name: 'Read HR', description: 'Allows viewing employees' },
    { code: 'hr.create', name: 'Manage HR', description: 'Allows adding employees' },
    { code: 'hr.update', name: 'Update HR', description: 'Allows editing employees' },
    { code: 'hr.delete', name: 'Delete HR', description: 'Allows deleting employees' },
    { code: 'hr.payroll.read', name: 'Read Payroll', description: 'Allows viewing payroll' },
    { code: 'hr.payroll.write', name: 'Manage Payroll', description: 'Allows managing payroll' },
  ],
  lifecycle: {
    onInstall: async () => {
      console.log('HR plugin onInstall triggered');
    },
    onEnable: async () => {
      console.log('HR plugin onEnable triggered');
    },
    onDisable: async () => {
      console.log('HR plugin onDisable triggered');
    },
  },
});

export default config;
