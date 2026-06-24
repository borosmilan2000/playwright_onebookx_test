import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  // Common elements
  readonly appRoot: Locator;
  readonly topBar: Locator;
  readonly brand: Locator;
  readonly brandIcon: Locator;
  readonly brandName: Locator;
  readonly darkModeToggle: Locator;
  readonly darkModeIcon: Locator;
  readonly mobileMenuButton: Locator;
  readonly desktopNav: Locator;

  constructor(page: Page) {
    this.page = page;

    // Top bar elements
    this.appRoot = page.locator('app-root');
    this.topBar = page.locator('app-top-bar');
    this.brand = page.locator('.brand');
    this.brandIcon = page.locator('.brand mat-icon');
    this.brandName = page.locator('.brand span');
    
    // Find the dark mode toggle button by the icon text
    this.darkModeToggle = page.locator('app-top-bar button:has(mat-icon:has-text("light_mode")), app-top-bar button:has(mat-icon:has-text("dark_mode"))');
    this.darkModeIcon = page.locator('app-top-bar mat-icon:has-text("light_mode"), app-top-bar mat-icon:has-text("dark_mode")');
    
    this.mobileMenuButton = page.locator('.mobile-menu button');
    this.desktopNav = page.locator('.desktop-nav');
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getCurrentTheme(): Promise<string> {
    // Get the current theme value from html element
    const theme = await this.page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    return theme || 'light';
  }

  async isDarkModeEnabled(): Promise<boolean> {
    const theme = await this.getCurrentTheme();
    return theme === 'dark';
  }

  async ensureLightMode(): Promise<void> {
    // Check current theme and toggle to light if it's dark
    const currentTheme = await this.getCurrentTheme();
    if (currentTheme === 'dark') {
      console.log('🌙 Currently in dark mode, toggling to light mode...');
      await this.toggleDarkMode();
      // Return the new theme without assertion - let the test handle assertions
      const newTheme = await this.getCurrentTheme();
      console.log(`✅ Switched to ${newTheme} mode`);
    } else {
      console.log('✅ Already in light mode');
    }
  }

  async ensureDarkMode(): Promise<void> {
    // Check current theme and toggle to dark if it's light
    const currentTheme = await this.getCurrentTheme();
    if (currentTheme === 'light') {
      console.log('☀️ Currently in light mode, toggling to dark mode...');
      await this.toggleDarkMode();
      const newTheme = await this.getCurrentTheme();
      console.log(`✅ Switched to ${newTheme} mode`);
    } else {
      console.log('✅ Already in dark mode');
    }
  }

  async toggleDarkMode(): Promise<void> {
    // Get current theme before clicking
    const currentTheme = await this.getCurrentTheme();
    console.log(`Current theme before toggle: ${currentTheme}`);
    
    // Get current icon text
    const currentIcon = await this.getDarkModeIconText();
    console.log(`Current icon: ${currentIcon}`);
    
    // Click the toggle button
    await this.darkModeToggle.click();
    console.log('🔄 Clicked dark mode toggle');
    
    // Wait a bit for the change to take effect
    await this.page.waitForTimeout(500);
    
    // Get theme after clicking
    const newTheme = await this.getCurrentTheme();
    console.log(`Theme after toggle: ${newTheme}`);
    
    // If theme didn't change, try clicking again
    if (newTheme === currentTheme) {
      console.warn(`⚠️ Theme did not change! Still ${newTheme}, trying again...`);
      await this.darkModeToggle.click();
      await this.page.waitForTimeout(500);
      const finalTheme = await this.getCurrentTheme();
      console.log(`Final theme after second click: ${finalTheme}`);
    }
    
    // Verify the icon changed
    const newIcon = await this.getDarkModeIconText();
    console.log(`New icon: ${newIcon}`);
  }

  async getDarkModeIconText(): Promise<string> {
    // Get the current icon text (light_mode or dark_mode)
    try {
      const icon = this.darkModeIcon.first();
      return await icon.textContent() || '';
    } catch (error) {
      console.warn('Could not find dark mode icon:', error);
      return '';
    }
  }


  // In BasePage.ts
async wait(ms: number): Promise<void> {
  await this.page.waitForTimeout(ms);
}

async waitForSelector(selector: string, options?: any): Promise<void> {
  await this.page.waitForSelector(selector, options);
}

async waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void> {
  await this.page.waitForLoadState(state);
}
  async waitForThemeChange(expectedTheme: 'light' | 'dark', timeout: number = 10000): Promise<boolean> {
    // Simple polling to check if theme changed
    const startTime = Date.now();
    let currentTheme = await this.getCurrentTheme();
    
    while (Date.now() - startTime < timeout) {
      if (currentTheme === expectedTheme) {
        console.log(`✅ Theme successfully changed to: ${expectedTheme}`);
        return true;
      }
      await this.page.waitForTimeout(200);
      currentTheme = await this.getCurrentTheme();
    }
    
    console.warn(`⚠️ Theme did not change to ${expectedTheme} within ${timeout}ms. Current: ${currentTheme}`);
    return false;
  }

  async getBrandName(): Promise<string> {
    return await this.brandName.textContent() || '';
  }

  async verifyDarkModeToggle(): Promise<{ initialTheme: string; finalTheme: string; initialIcon: string; finalIcon: string }> {
    const initialTheme = await this.getCurrentTheme();
    const initialIcon = await this.getDarkModeIconText();
    
    console.log(`Initial theme: ${initialTheme}, Icon: ${initialIcon}`);
    
    await this.toggleDarkMode();
    await this.page.waitForTimeout(1000);
    
    const finalTheme = await this.getCurrentTheme();
    const finalIcon = await this.getDarkModeIconText();
    
    console.log(`Final theme: ${finalTheme}, Icon: ${finalIcon}`);
    
    return { initialTheme, finalTheme, initialIcon, finalIcon };
  }
}