import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Email step
  readonly emailInput: Locator;
  readonly sendCodeButton: Locator;
  
  // Verification code step (appears after email is sent)
  readonly codeInput: Locator;
  readonly verifyButton: Locator;
  
  // Error messages
  readonly errorMessage: Locator;
  readonly emailLabel: Locator;

  constructor(page: Page) {
    super(page);
    
    // Email step - based on your HTML
    this.emailInput = page.locator('#email');
    this.emailLabel = page.locator('label[for="email"]');
    this.sendCodeButton = page.locator('button[type="submit"]:has-text("Send login code")');
    
    // Verification code step - these will appear after sending code
    // Cloudflare Access typically shows a code input field
    this.codeInput = page.locator('input[name="code"], input[type="text"][inputmode="numeric"]');
    this.verifyButton = page.locator('button[type="submit"]:has-text("Verify"), button:has-text("Submit")');
    
    // Error message
    this.errorMessage = page.locator('.Message-is-error, .Message, .alert-danger');
  }

  async goto() {
    await this.page.goto('https://staging.onebookx.com');
    await this.waitForLoad();
  }

  async enterEmail(email: string) {
    console.log(`📧 Entering email: ${email}`);
    await this.emailInput.fill(email);
  }

  async clickSendCode() {
    console.log('📤 Sending verification code...');
    await this.sendCodeButton.click();
  }

  async sendEmail(email: string) {
    await this.enterEmail(email);
    await this.clickSendCode();
    
    // Wait for the code input to appear (Cloudflare Access shows it after email)
    // The code input might be a new input field or the same form
    await this.page.waitForTimeout(3000); // Wait for the page to update
  }

  async enterVerificationCode(code: string) {
    console.log(`🔑 Entering verification code: ${code}`);
    // The code input might be the same email input or a new one
    // Let's check for common patterns
    const codeInput = this.page.locator('input[name="code"], input[type="text"][inputmode="numeric"]');
    
    if (await codeInput.isVisible()) {
      await codeInput.fill(code);
    } else {
      // Sometimes Cloudflare uses the email input for code
      // Or a hidden input appears
      await this.page.locator('input[type="text"]:not([name="email"]):not([hidden])').fill(code);
    }
  }

  async clickVerify() {
    console.log('✅ Verifying code...');
    const verifyBtn = this.page.locator('button[type="submit"]:has-text("Verify"), button:has-text("Submit"), button:has-text("Continue")');
    await verifyBtn.click();
  }

  async loginWithCode(email: string, code: string) {
    await this.goto();
    await this.enterEmail(email);
    await this.clickSendCode();
    
    // Wait for the code input to appear (may be the same page with new fields)
    await this.page.waitForTimeout(3000);
    
    // Try to find and fill the code input
    await this.enterVerificationCode(code);
    await this.clickVerify();
    
    // Wait for redirect to home
    await this.page.waitForURL('https://staging.onebookx.com/', { timeout: 10000 });
    console.log('✅ Login successful!');
  }

  async isCodeFieldVisible(): Promise<boolean> {
    const codeInput = this.page.locator('input[name="code"], input[type="text"][inputmode="numeric"]');
    return await codeInput.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isEmailFieldVisible(): Promise<boolean> {
    return await this.emailInput.isVisible();
  }
}