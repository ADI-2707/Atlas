export interface IConfigManager {
  get<T>(key: string, defaultValue?: T): T;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
}

export class ConfigManager implements IConfigManager {
  private config: Map<string, any> = new Map();
  private static instance: ConfigManager;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get<T>(key: string, defaultValue?: T): T {
    if (this.config.has(key)) {
      return this.config.get(key) as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Config key not found: ${key}`);
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }
}

export const configManager = ConfigManager.getInstance();

export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: Map<string, boolean> = new Map();

  private constructor() {}

  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  isEnabled(feature: string, defaultValue: boolean = false): boolean {
    if (this.flags.has(feature)) {
      return this.flags.get(feature)!;
    }
    return defaultValue;
  }

  enable(feature: string): void {
    this.flags.set(feature, true);
  }

  disable(feature: string): void {
    this.flags.set(feature, false);
  }
}

export const featureFlags = FeatureFlagManager.getInstance();
