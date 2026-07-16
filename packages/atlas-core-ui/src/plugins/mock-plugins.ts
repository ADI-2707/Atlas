import { PluginNavigationItem } from '@atlas/plugin-sdk';

export interface MockPlugin {
  id: string;
  name: string;
  description: string;
  navigation: PluginNavigationItem[];
}

export const mockPlugins: MockPlugin[] = [
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Track and manage your enterprise assets across multiple warehouses.',
    navigation: [
      { title: 'Inventory', path: '/inventory', icon: 'inventory', permissions: ['inventory.read'] }
    ]
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Manage customer relationships, sales pipelines, and support tickets.',
    navigation: [
      { title: 'CRM', path: '/crm', icon: 'crm', permissions: ['crm.read'] }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Engine',
    description: 'Real-time data processing and visual insights for your business metrics.',
    navigation: [
      { title: 'Analytics', path: '/analytics', icon: 'analytics', permissions: ['analytics.read'] }
    ]
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Manage payroll, employee records, and recruitment processes.',
    navigation: [
      { title: 'HR Portal', path: '/hr', icon: 'hr', permissions: ['hr.read'] }
    ]
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Enterprise project management and issue tracking plugin.',
    navigation: [
      { title: 'Projects', path: '/project-management', icon: 'pm', permissions: ['project-management.read'] }
    ]
  }
];
