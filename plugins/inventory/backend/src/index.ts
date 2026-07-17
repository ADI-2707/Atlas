import { AtlasPlugin } from '@atlas/plugin-sdk';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { InventoryPrismaService } from './prisma/inventory-prisma.service';
import manifest from '../../manifest.json';

const config = AtlasPlugin({
  manifest,
  controllers: [InventoryController],
  providers: [InventoryService, InventoryPrismaService],
  permissions: [
    {
      code: 'inventory.read',
      name: 'Read Inventory',
      description: 'Allows viewing stock levels',
    },
    {
      code: 'inventory.write',
      name: 'Manage Inventory',
      description: 'Allows editing products and stock',
    },
  ],
  lifecycle: {
    onInstall: async () => {
      console.log('Inventory plugin onInstall triggered');
    },
    onEnable: async () => {
      console.log('Inventory plugin onEnable triggered');
    },
    onDisable: async () => {
      console.log('Inventory plugin onDisable triggered');
    },
  },
});

export default config;
