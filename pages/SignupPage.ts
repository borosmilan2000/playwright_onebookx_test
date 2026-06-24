import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignupPage extends BasePage {
  // Signup form elements
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly businessNameInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.locator('input[name="name"], input[placeholder*="Név"]');
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"]');
    this.confirmPasswordInput = page.locator('input[placeholder*="jelszó megerősítése"]');
    this.businessNameInput = page.locator('input[placeholder*="vállalkozás"], input[name="business"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.loginLink = page.locator('a[href*="login"]');
    this.errorMessage = page.locator('.error-message, .alert-danger, mat-error');
  }

  async goto(p0?: string) {
    await this.page.goto('/signup');
    await this.waitForLoad();
  }

  async signup(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    businessName?: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    
    if (data.confirmPassword) {
      await this.confirmPasswordInput.fill(data.confirmPassword);
    } else {
      await this.confirmPasswordInput.fill(data.password);
    }
    
    if (data.businessName) {
      await this.businessNameInput.fill(data.businessName);
    }

    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }

  async isSignupFormVisible(): Promise<boolean> {
    return await this.nameInput.isVisible() && 
           await this.emailInput.isVisible() && 
           await this.passwordInput.isVisible() && 
           await this.submitButton.isVisible();
  }
}