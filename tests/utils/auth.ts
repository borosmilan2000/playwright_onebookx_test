import { BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const STORAGE_STATE_PATH = path.join(process.cwd(), 'playwright/.auth/storageState.json');

export class AuthHelper {
  static async saveStorageState(context: BrowserContext): Promise<void> {
    const dir = path.dirname(STORAGE_STATE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const storageState = await context.storageState();
    fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2));
    console.log(`✅ Storage state saved to: ${STORAGE_STATE_PATH}`);
    
    const cookies = storageState.cookies || [];
    console.log(`🍪 Saved ${cookies.length} cookies`);
  }

  static loadStorageState(): any | undefined {
    if (!fs.existsSync(STORAGE_STATE_PATH)) {
      return undefined;
    }
    const data = fs.readFileSync(STORAGE_STATE_PATH, 'utf-8');
    return JSON.parse(data);
  }

  static hasStorageState(): boolean {
    return fs.existsSync(STORAGE_STATE_PATH);
  }

  static clearStorageState(): void {
    if (fs.existsSync(STORAGE_STATE_PATH)) {
      fs.unlinkSync(STORAGE_STATE_PATH);
      console.log(`🗑️ Storage state cleared`);
    }
  }

  static getStoragePath(): string {
    return STORAGE_STATE_PATH;
  }
}