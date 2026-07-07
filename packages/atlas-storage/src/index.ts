import fs from 'fs';
import path from 'path';

export interface IStorageProvider {
  upload(fileId: string, content: Buffer | string, contentType?: string): Promise<string>;
  download(fileId: string): Promise<Buffer>;
  delete(fileId: string): Promise<boolean>;
  getUrl(fileId: string): string;
}

export class LocalDiskStorageProvider implements IStorageProvider {
  private baseDir: string;
  private baseUrl: string;

  constructor(options: { baseDir: string; baseUrl: string }) {
    this.baseDir = options.baseDir;
    this.baseUrl = options.baseUrl;

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(fileId: string, content: Buffer | string): Promise<string> {
    const filePath = path.join(this.baseDir, fileId);
    await fs.promises.writeFile(filePath, content);
    return this.getUrl(fileId);
  }

  async download(fileId: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, fileId);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${fileId}`);
    }
    return fs.promises.readFile(filePath);
  }

  async delete(fileId: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, fileId);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  getUrl(fileId: string): string {
    return `${this.baseUrl}/${fileId}`;
  }
}

let defaultProvider: IStorageProvider | null = null;

export const StorageFactory = {
  initialize(provider: IStorageProvider) {
    defaultProvider = provider;
  },
  getProvider(): IStorageProvider {
    if (!defaultProvider) {
      throw new Error('Storage provider not initialized.');
    }
    return defaultProvider;
  }
};
