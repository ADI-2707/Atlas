import { AtlasPlugin } from '@atlas/plugin-sdk';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';

const manifest = {
  id: 'analytics',
  name: 'Analytics Engine',
  version: '1.0.0',
  author: 'Atlas Team',
  description: 'Real-time data processing, visual insights, and AI forecasting.',
  atlasVersion: '1.0.0',
  dependencies: [],
  permissions: ['analytics.read', 'analytics.reports', 'analytics.anomalies', 'analytics.forecasts'],
  events: [],
  routes: ['/analytics/dashboard', '/analytics/anomalies'],
  widgets: [],
};

const config = AtlasPlugin({
  manifest,
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  permissions: [
    { code: 'analytics.read', name: 'Read Analytics', description: 'Allows viewing core analytics' },
    { code: 'analytics.reports', name: 'Generate Reports', description: 'Allows generating PDF/CSV reports' },
    { code: 'analytics.anomalies', name: 'View Anomalies', description: 'Allows viewing anomaly detection alerts' },
    { code: 'analytics.forecasts', name: 'View Forecasts', description: 'Allows viewing AI predictive forecasts' },
  ],
  lifecycle: {
    onInstall: async () => {
      console.log('Analytics plugin onInstall triggered');
    },
    onEnable: async () => {
      console.log('Analytics plugin onEnable triggered');
    },
    onDisable: async () => {
      console.log('Analytics plugin onDisable triggered');
    },
  },
});

export default config;
