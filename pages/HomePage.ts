import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Hero section
  readonly heroSection: Locator;
  readonly heroBadge: Locator;
  readonly heroBadgeIcon: Locator;
  readonly heroBadgeText: Locator;
  readonly heroTitle: Locator;
  readonly heroAccent: Locator;
  readonly heroSubtitle: Locator;
  readonly heroActions: Locator;
  readonly ctaButton: Locator;
  readonly ctaButtonIcon: Locator;
  readonly ctaButtonText: Locator;
  readonly loginButton: Locator;

  // Navigation buttons
  readonly navHome: Locator;
  readonly navLogin: Locator;
  readonly navSignup: Locator;

  // Steps section
  readonly stepsSection: Locator;
  readonly stepsTitle: Locator;
  readonly stepCards: Locator;

  // Features section
  readonly featuresSection: Locator;
  readonly featureCards: Locator;

  // Bottom CTA
  readonly ctaBottom: Locator;
  readonly ctaBottomTitle: Locator;
  readonly ctaBottomSubtitle: Locator;
  readonly ctaBottomButton: Locator;

  constructor(page: Page) {
    super(page);

    // Hero section
    this.heroSection = page.locator('.hero');
    this.heroBadge = page.locator('.hero-badge');
    this.heroBadgeIcon = page.locator('.hero-badge mat-icon');
    this.heroBadgeText = page.locator('.hero-badge span');
    this.heroTitle = page.locator('.hero-title');
    this.heroAccent = page.locator('.hero-accent');
    this.heroSubtitle = page.locator('.hero-sub');
    this.heroActions = page.locator('.hero-actions');
    this.ctaButton = page.locator('.hero-actions .cta-btn');
    this.ctaButtonIcon = page.locator('.hero-actions .cta-btn mat-icon');
    this.ctaButtonText = page.locator('.hero-actions .cta-btn .mdc-button__label');
    this.loginButton = page.locator('.hero-actions .login-btn');

    // Navigation buttons
    this.navHome = page.locator('.nav-links button:has-text("Főoldal")');
    this.navLogin = page.locator('.nav-links button:has-text("Bejelentkezés")');
    this.navSignup = page.locator('.nav-links button:has-text("Regisztráció")');

    // Steps section
    this.stepsSection = page.locator('.steps-section');
    this.stepsTitle = page.locator('.steps-title');
    this.stepCards = page.locator('.step');

    // Features section
    this.featuresSection = page.locator('.features');
    this.featureCards = page.locator('.feature-card');

    // Bottom CTA
    this.ctaBottom = page.locator('.cta-bottom');
    this.ctaBottomTitle = page.locator('.cta-bottom h2');
    this.ctaBottomSubtitle = page.locator('.cta-bottom p');
    this.ctaBottomButton = page.locator('.cta-bottom .cta-btn');
  }

  async goto() {
    await this.page.goto('https://staging.onebookx.com');
    await this.waitForLoad();
  }

  // Navigation methods
  async clickNavHome() {
    await this.navHome.click();
  }

  async clickNavLogin() {
    await this.navLogin.click();
  }

  async clickNavSignup() {
    await this.navSignup.click();
  }

  // Hero section methods
  async clickGetStarted() {
    await this.ctaButton.click();
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async getHeroTitleText(): Promise<string> {
    return await this.heroTitle.textContent() || '';
  }

  async getHeroSubtitleText(): Promise<string> {
    return await this.heroSubtitle.textContent() || '';
  }

  async getBadgeText(): Promise<string> {
    return await this.heroBadgeText.textContent() || '';
  }

  // Steps section methods
  async getStepCount(): Promise<number> {
    return await this.stepCards.count();
  }

  async getStepNumber(stepIndex: number): Promise<string> {
    const step = this.stepCards.nth(stepIndex);
    const num = step.locator('.step-num');
    return await num.textContent() || '';
  }

  async getStepTitle(stepIndex: number): Promise<string> {
    const step = this.stepCards.nth(stepIndex);
    const title = step.locator('h3');
    return await title.textContent() || '';
  }

  async getStepDescription(stepIndex: number): Promise<string> {
    const step = this.stepCards.nth(stepIndex);
    const desc = step.locator('p');
    return await desc.textContent() || '';
  }

  // Features section methods
  async getFeatureCount(): Promise<number> {
    return await this.featureCards.count();
  }

  async getFeatureTitle(featureIndex: number): Promise<string> {
    const card = this.featureCards.nth(featureIndex);
    const title = card.locator('h3');
    return await title.textContent() || '';
  }

  async getFeatureDescription(featureIndex: number): Promise<string> {
    const card = this.featureCards.nth(featureIndex);
    const desc = card.locator('p');
    return await desc.textContent() || '';
  }

  async getFeatureIcon(featureIndex: number): Promise<string> {
    const card = this.featureCards.nth(featureIndex);
    const icon = card.locator('mat-icon');
    return await icon.textContent() || '';
  }

  // Bottom CTA methods
  async clickBottomCTA() {
    await this.ctaBottomButton.click();
  }

  async getBottomCTATitle(): Promise<string> {
    return await this.ctaBottomTitle.textContent() || '';
  }

  async getBottomCTASubtitle(): Promise<string> {
    return await this.ctaBottomSubtitle.textContent() || '';
  }

  // Verification methods
  async isHeroVisible(): Promise<boolean> {
    return await this.heroSection.isVisible();
  }

  async isStepsSectionVisible(): Promise<boolean> {
    return await this.stepsSection.isVisible();
  }

  async isFeaturesSectionVisible(): Promise<boolean> {
    return await this.featuresSection.isVisible();
  }

  async isBottomCTAVisible(): Promise<boolean> {
    return await this.ctaBottom.isVisible();
  }

  async isBrandVisible(): Promise<boolean> {
    return await this.brand.isVisible();
  }

  async isDarkModeToggleVisible(): Promise<boolean> {
    return await this.darkModeToggle.isVisible();
  }

  // Navigation verification
  async isNavHomeActive(): Promise<boolean> {
    const classes = await this.navHome.getAttribute('class') || '';
    return classes.includes('active');
  }
  async toggleDarkMode(): Promise<void> {
  // Get current icon before click
  const currentIcon = await this.darkModeToggle.locator('mat-icon').textContent();
  console.log(`Current icon: ${currentIcon}`);
  
  await this.darkModeToggle.click();
  
  // Wait for theme attribute to change
  const currentTheme = await this.getCurrentTheme();
  const expectedTheme = currentTheme === 'light' ? 'dark' : 'light';
  await this.waitForThemeChange(expectedTheme);
  
  // Verify icon changed
  const newIcon = await this.darkModeToggle.locator('mat-icon').textContent();
  console.log(`New icon: ${newIcon}`);
  
  // Verify theme changed
  const isDark = await this.isDarkModeEnabled();
  console.log(`Dark mode enabled: ${isDark}`);
  }
}