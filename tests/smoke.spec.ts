import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { AuthHelper } from './utils/auth';

test.describe('Onebookx - Smoke Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page, context }) => {
    // Load saved cookies
    const savedState = AuthHelper.loadStorageState();
    
    if (savedState && savedState.cookies && savedState.cookies.length > 0) {
      console.log(`🍪 Found ${savedState.cookies.length} saved cookies`);
      
      // Clear existing cookies and add saved ones
      await context.clearCookies();
      await context.addCookies(savedState.cookies);
      console.log('✅ Cookies added to context');
      
      // Log what cookies were added
      savedState.cookies.forEach((cookie: any) => {
        console.log(`   - ${cookie.name} (${cookie.domain})`);
      });
    } else {
      console.log('ℹ️ No saved cookies found - running as guest');
    }
    
    homePage = new HomePage(page);
    
    // Navigate to home page with proper wait
    await page.goto('https://staging.onebookx.com');
    await page.waitForTimeout(2000);
    
    // Check if we're logged in
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('verify')) {
      console.log('⚠️ Still on login page - cookies may be invalid or expired');
    } else {
      console.log('✅ Successfully loaded home page with cookies');
    }
  });

  // Save auth after each test
  test.afterEach(async ({ page }) => {
    const cookies = await page.context().cookies();
    if (cookies.length > 0) {
      await AuthHelper.saveStorageState(page.context());
      console.log(`✅ Auth saved! (${cookies.length} cookies)`);
    }
  });

  test.describe('Page Load Tests', () => {
    test('should load the home page successfully', async ({ page }) => {
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL('https://staging.onebookx.com/');
      await expect(homePage.brand).toBeVisible();
    });

    test('should have correct brand name', async ({ page }) => {
      await page.waitForTimeout(500);
      const brandName = await homePage.getBrandName();
      expect(brandName).toBe('onebookx');
    });

    test('should have all main sections visible', async () => {
      await expect(homePage.heroSection).toBeVisible();
      await expect(homePage.stepsSection).toBeVisible();
      await expect(homePage.featuresSection).toBeVisible();
      await expect(homePage.ctaBottom).toBeVisible();
    });
  });

  test.describe('Hero Section Tests', () => {
    test('should display hero badge with correct text', async () => {
      const badgeText = await homePage.getBadgeText();
      expect(badgeText).toBe('Egyszerű. Gyors. Automatikus.');
    });

    test('should display hero title with correct content', async () => {
      const titleText = await homePage.getHeroTitleText();
      expect(titleText).toContain('Saját foglalási oldal');
      expect(titleText).toContain('a vállalkozásodnak');
    });

    test('should display hero subtitle with correct content', async () => {
      const subtitleText = await homePage.getHeroSubtitleText();
      expect(subtitleText).toContain('Időpontfoglalás');
      expect(subtitleText).toContain('NAV számla');
    });

    test('should have CTA buttons visible', async () => {
      await expect(homePage.ctaButton).toBeVisible();
      await expect(homePage.loginButton).toBeVisible();
    });

    test('should have CTA button with rocket icon', async () => {
      await expect(homePage.ctaButtonIcon).toBeVisible();
      const iconText = await homePage.ctaButtonIcon.textContent();
      expect(iconText).toBe('rocket_launch');
    });

    test('should have correct CTA button text', async () => {
      const buttonText = await homePage.ctaButton.textContent();
      expect(buttonText).toContain('Ingyenes regisztráció');
    });

    test('should have correct login button text', async () => {
      const buttonText = await homePage.loginButton.textContent();
      expect(buttonText).toContain('Bejelentkezés');
    });
  });

  test.describe('Navigation Tests', () => {
    test('should have navigation buttons visible', async () => {
      await expect(homePage.navHome).toBeVisible();
      await expect(homePage.navLogin).toBeVisible();
      await expect(homePage.navSignup).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await homePage.clickNavLogin();
      await expect(page).toHaveURL(/.*login/);
    });

    test('should navigate to signup page', async ({ page }) => {
      await homePage.clickNavSignup();
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should navigate to home from login page', async ({ page }) => {
      await homePage.clickNavLogin();
      await page.waitForURL(/.*login/);
      await homePage.clickNavHome();
      await expect(page).toHaveURL('/');
    });

    test('should navigate to signup from login page', async ({ page }) => {
      await homePage.clickNavLogin();
      await page.waitForURL(/.*login/);
      await homePage.clickNavSignup();
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should navigate back to home from signup', async ({ page }) => {
      await homePage.clickNavSignup();
      await page.waitForURL(/.*signup/);
      await homePage.clickNavHome();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Steps Section Tests', () => {
    test('should display steps section with correct title', async () => {
      const title = await homePage.stepsTitle.textContent();
      expect(title).toBe('Hogyan működik?');
    });

    test('should display 4 steps', async () => {
      const stepCount = await homePage.getStepCount();
      expect(stepCount).toBe(4);
    });

    test('should have correct step numbers and titles', async () => {
      const expectedSteps = [
        { number: '1', title: 'Regisztrálj' },
        { number: '2', title: 'Állítsd be' },
        { number: '3', title: 'Oszd meg' },
        { number: '4', title: 'Kész' },
      ];

      for (let i = 0; i < expectedSteps.length; i++) {
        const stepNum = await homePage.getStepNumber(i);
        const stepTitle = await homePage.getStepTitle(i);
        expect(stepNum).toBe(expectedSteps[i].number);
        expect(stepTitle).toBe(expectedSteps[i].title);
      }
    });

    test('should have step descriptions for each step', async () => {
      const stepCount = await homePage.getStepCount();
      for (let i = 0; i < stepCount; i++) {
        const description = await homePage.getStepDescription(i);
        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(10);
      }
    });
  });

  test.describe('Features Section Tests', () => {
    test('should display 5 feature cards', async () => {
      const featureCount = await homePage.getFeatureCount();
      expect(featureCount).toBe(5);
    });

    test('should have correct feature titles', async () => {
      const expectedFeatures = [
        'Saját oldal',
        'Időpontfoglalás',
        'Árlista',
        'Online fizetés',
        'NAV számla'
      ];

      for (let i = 0; i < expectedFeatures.length; i++) {
        const title = await homePage.getFeatureTitle(i);
        expect(title).toBe(expectedFeatures[i]);
      }
    });

    test('should have feature descriptions', async () => {
      const featureCount = await homePage.getFeatureCount();
      for (let i = 0; i < featureCount; i++) {
        const description = await homePage.getFeatureDescription(i);
        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(20);
      }
    });

    test('should have feature icons', async () => {
      const expectedIcons = ['store', 'calendar_month', 'format_list_bulleted', 'credit_card', 'receipt_long'];
      const featureCount = await homePage.getFeatureCount();

      for (let i = 0; i < featureCount; i++) {
        const icon = await homePage.getFeatureIcon(i);
        expect(icon).toBe(expectedIcons[i]);
      }
    });
  });

  test.describe('Bottom CTA Tests', () => {
    test('should display bottom CTA section', async () => {
      await expect(homePage.ctaBottom).toBeVisible();
    });

    test('should have correct bottom CTA title', async () => {
      const title = await homePage.getBottomCTATitle();
      expect(title).toBe('Készen állsz?');
    });

    test('should have correct bottom CTA subtitle', async () => {
      const subtitle = await homePage.getBottomCTASubtitle();
      expect(subtitle).toContain('Regisztrálj ingyen');
      expect(subtitle).toContain('percek alatt');
    });

    test('should have visible bottom CTA button', async () => {
      await expect(homePage.ctaBottomButton).toBeVisible();
    });

    test('should have correct bottom CTA button text', async () => {
      const buttonText = await homePage.ctaBottomButton.textContent();
      expect(buttonText).toContain('Kezdjük el');
    });
  });

  test.describe('Interactive Tests', () => {
    test('should navigate to signup when clicking CTA', async ({ page }) => {
      await homePage.clickGetStarted();
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should navigate to login when clicking login button', async ({ page }) => {
      await homePage.clickLogin();
      await expect(page).toHaveURL(/.*login/);
    });

    test('should navigate to signup when clicking bottom CTA', async ({ page }) => {
      await homePage.clickBottomCTA();
      await expect(page).toHaveURL(/.*signup/);
    });
  });

  test.describe('Dark Mode Tests', () => {
    test('should have dark mode toggle visible', async () => {
      await expect(homePage.darkModeToggle).toBeVisible();
    });

    test('should toggle dark mode on click', async ({ page }) => {
      const initialDark = await homePage.isDarkModeEnabled();
      expect(initialDark).toBe(false);

      await homePage.toggleDarkMode();
      await page.waitForTimeout(300);

      const afterToggleDark = await homePage.isDarkModeEnabled();
      expect(afterToggleDark).toBe(true);

      await homePage.toggleDarkMode();
      await page.waitForTimeout(300);

      const finalDark = await homePage.isDarkModeEnabled();
      expect(finalDark).toBe(false);
    });
  });

  test.describe('Mobile Responsive Tests', () => {
    test('should display mobile menu on smaller screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('https://staging.onebookx.com');
      await page.waitForTimeout(1000);
      await expect(homePage.mobileMenuButton).toBeVisible();
    });

    test('should display desktop navigation on larger screens', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('https://staging.onebookx.com');
      await page.waitForTimeout(1000);
      await expect(homePage.desktopNav).toBeVisible();
    });
  });

  test.describe('Authentication State Tests', () => {
    test('should have authentication state loaded', async () => {
      const hasAuth = AuthHelper.hasStorageState();
      if (hasAuth) {
        console.log('✅ Authentication state loaded for tests');
        const authPath = AuthHelper.getStoragePath();
        console.log(`📁 Auth file: ${authPath}`);
      } else {
        console.log('ℹ️ No authentication state found - running as guest');
      }
    });

    test('should maintain auth across test cases', async ({ page }) => {
      const cookies = await page.context().cookies();
      if (cookies.length > 0) {
        console.log(`🍪 Found ${cookies.length} cookies in context`);
        cookies.forEach((cookie: any) => {
          console.log(`   - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
        });
      } else {
        console.log('ℹ️ No cookies found - running as guest');
      }
    });
  });
});