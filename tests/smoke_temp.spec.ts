import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { AuthHelper } from './utils/auth';

// Load saved authentication if available
test.use({
  storageState: AuthHelper.loadStorageState(),
});

test.describe('Onebookx - Consolidated Smoke Tests', () => {
  let homePage: HomePage;
  let testContext: any; // Store context for cleanup

  test.beforeEach(async ({ page, context }) => {
    testContext = context; // Store context for cleanup
    
    try {
      // Load saved cookies
      const savedState = AuthHelper.loadStorageState();
      
      if (savedState && savedState.cookies && savedState.cookies.length > 0) {
        console.log(`🍪 Found ${savedState.cookies.length} saved cookies`);
        await context.clearCookies();
        await context.addCookies(savedState.cookies);
        console.log('✅ Cookies added to context');
      } else {
        console.log('ℹ️ No saved cookies found - running as guest');
      }
      
      homePage = new HomePage(page);
      await page.goto('https://staging.onebookx.com', {timeout: 30000});
      await page.waitForTimeout(2000);
    } catch (error) {
      console.error('❌ Error in beforeEach:', error);
      // Clean up on error
      await cleanupContext(context);
      throw error;
    }
  });

  // Comprehensive cleanup function
  async function cleanupContext(context: any) {
    try {
      if (context) {
        // Close all pages in the context
        const pages = context.pages();
        for (const page of pages) {
          try {
            if (!page.isClosed()) {
              await page.close();
            }
          } catch (e) {
            // Ignore errors when closing pages
          }
        }
        
        // Close the context
        if (context._browserContext) {
          await context._browserContext.close();
        }
        console.log('🧹 Browser context cleaned up');
      }
    } catch (error) {
      console.warn('⚠️ Error during cleanup:', error);
    }
  }

  // Enhanced afterEach with error handling
  test.afterEach(async ({ page, context }, testInfo) => {
    try {
      // Save auth if test passed or failed (unless it's a critical auth error)
      if (testInfo.status !== 'failed' || !testInfo.error?.message?.includes('auth')) {
        const cookies = await page.context().cookies();
        if (cookies.length > 0) {
          await AuthHelper.saveStorageState(page.context());
          console.log(`✅ Auth saved! (${cookies.length} cookies)`);
        }
      }

      // Force cleanup regardless of test status
      await cleanupContext(context);
      
      console.log(`📊 Test status: ${testInfo.status}`);
    } catch (error) {
      console.warn('⚠️ Error in afterEach cleanup:', error);
      // Even if cleanup fails, ensure we try to close everything
      try {
        await cleanupContext(context);
      } catch (e) {
        // Last resort cleanup
        console.warn('⚠️ Last resort cleanup attempt');
      }
    }
  });

  test('complete smoke test suite', async ({ page }) => {
    let testFailed = false;
    
    try {
      console.log('\n🚀 STARTING CONSOLIDATED SMOKE TEST');
      console.log('=' .repeat(50));
      
      // ============================================
      // 1. PAGE LOAD TESTS
      // ============================================
      console.log('\n📄 PAGE LOAD TESTS');
      console.log('-' .repeat(30));
      
      await test.step('Page Load Tests', async () => {
        // Test 1: Load home page successfully
        await test.step('should load the home page successfully', async () => {
          await page.waitForTimeout(1000);
          await expect(page).toHaveURL('https://staging.onebookx.com/', { timeout: 30000 });
          await expect(homePage.brand).toBeVisible();
          console.log('✅ Home page loaded successfully');
        });

        // Test 2: Check brand name
        await test.step('should have correct brand name', async () => {
          await page.waitForTimeout(500);
          const brandName = await homePage.getBrandName();
          expect(brandName).toBe('onebookx');
          console.log(`✅ Brand name: ${brandName}`);
        });

        // Test 3: All main sections visible
        await test.step('should have all main sections visible', async () => {
          await expect(homePage.heroSection).toBeVisible();
          await expect(homePage.stepsSection).toBeVisible();
          await expect(homePage.featuresSection).toBeVisible();
          await expect(homePage.ctaBottom).toBeVisible();
          console.log('✅ All main sections visible');
        });
      });

      // ============================================
      // 2. HERO SECTION TESTS
      // ============================================
      console.log('\n🎯 HERO SECTION TESTS');
      console.log('-' .repeat(30));

      await test.step('Hero Section Tests', async () => {
        // Test 4: Hero badge text
        await test.step('should display hero badge with correct text', async () => {
          const badgeText = await homePage.getBadgeText();
          expect(badgeText).toBe('Egyszerű. Gyors. Automatikus.');
          console.log(`✅ Badge text: ${badgeText}`);
        });

        // Test 5: Hero title
        await test.step('should display hero title with correct content', async () => {
          const titleText = await homePage.getHeroTitleText();
          expect(titleText).toContain('Saját foglalási oldal');
          expect(titleText).toContain('a vállalkozásodnak');
          console.log(`✅ Hero title: ${titleText.substring(0, 30)}...`);
        });

        // Test 6: Hero subtitle
        await test.step('should display hero subtitle with correct content', async () => {
          const subtitleText = await homePage.getHeroSubtitleText();
          expect(subtitleText).toContain('Időpontfoglalás');
          expect(subtitleText).toContain('NAV számla');
          console.log(`✅ Hero subtitle: ${subtitleText.substring(0, 30)}...`);
        });

        // Test 7: CTA buttons visible
        await test.step('should have CTA buttons visible', async () => {
          await expect(homePage.ctaButton).toBeVisible();
          await expect(homePage.loginButton).toBeVisible();
          console.log('✅ CTA buttons visible');
        });

        // Test 8: CTA button icon
        await test.step('should have CTA button with rocket icon', async () => {
          await expect(homePage.ctaButtonIcon).toBeVisible();
          const iconText = await homePage.ctaButtonIcon.textContent();
          expect(iconText).toBe('rocket_launch');
          console.log(`✅ CTA icon: ${iconText}`);
        });

        // Test 9: CTA button text
        await test.step('should have correct CTA button text', async () => {
          const buttonText = await homePage.ctaButton.textContent();
          expect(buttonText).toContain('Ingyenes regisztráció');
          console.log(`✅ CTA button text: ${buttonText?.trim()}`);
        });

        // Test 10: Login button text
        await test.step('should have correct login button text', async () => {
          const buttonText = await homePage.loginButton.textContent();
          expect(buttonText).toContain('Bejelentkezés');
          console.log(`✅ Login button text: ${buttonText?.trim()}`);
        });
      });

      // ============================================
      // 3. NAVIGATION TESTS
      // ============================================
      console.log('\n🧭 NAVIGATION TESTS');
      console.log('-' .repeat(30));

      await test.step('Navigation Tests', async () => {
        // Test 11: Navigation buttons visible
        await test.step('should have navigation buttons visible', async () => {
          await expect(homePage.navHome).toBeVisible();
          await expect(homePage.navLogin).toBeVisible();
          await expect(homePage.navSignup).toBeVisible();
          console.log('✅ Navigation buttons visible');
        });

        // Test 12: Navigate to login
        await test.step('should navigate to login page', async () => {
          await homePage.clickNavLogin();
          await expect(page).toHaveURL(/.*login/);
          console.log('✅ Navigated to login page');
          // Go back to home
          await homePage.clickNavHome();
          await page.waitForTimeout(500);
        });

        // Test 13: Navigate to signup
        await test.step('should navigate to signup page', async () => {
          await homePage.clickNavSignup();
          await expect(page).toHaveURL(/.*signup/);
          console.log('✅ Navigated to signup page');
          // Go back to home
          await homePage.clickNavHome();
          await page.waitForTimeout(500);
        });

        // Test 14: Navigate from login to home
        await test.step('should navigate to home from login page', async () => {
          await homePage.clickNavLogin();
          await page.waitForURL(/.*login/);
          await homePage.clickNavHome();
          await expect(page).toHaveURL('/');
          console.log('✅ Navigated from login to home');
        });

        // Test 15: Navigate from login to signup
        await test.step('should navigate to signup from login page', async () => {
          await homePage.clickNavLogin();
          await page.waitForURL(/.*login/);
          await homePage.clickNavSignup();
          await expect(page).toHaveURL(/.*signup/);
          console.log('✅ Navigated from login to signup');
          // Go back to home
          await homePage.clickNavHome();
          await page.waitForTimeout(500);
        });

        // Test 16: Navigate from signup to home
        await test.step('should navigate back to home from signup', async () => {
          await homePage.clickNavSignup();
          await page.waitForURL(/.*signup/);
          await homePage.clickNavHome();
          await expect(page).toHaveURL('/');
          console.log('✅ Navigated from signup to home');
        });
      });

      // ============================================
      // 4. STEPS SECTION TESTS
      // ============================================
      console.log('\n📋 STEPS SECTION TESTS');
      console.log('-' .repeat(30));

      await test.step('Steps Section Tests', async () => {
        // Test 17: Steps title
        await test.step('should display steps section with correct title', async () => {
          const title = await homePage.stepsTitle.textContent();
          expect(title).toBe('Hogyan működik?');
          console.log(`✅ Steps title: ${title}`);
        });

        // Test 18: Step count
        await test.step('should display 4 steps', async () => {
          const stepCount = await homePage.getStepCount();
          expect(stepCount).toBe(4);
          console.log(`✅ Step count: ${stepCount}`);
        });

        // Test 19: Step numbers and titles
        await test.step('should have correct step numbers and titles', async () => {
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
            console.log(`   Step ${stepNum}: ${stepTitle}`);
          }
        });

        // Test 20: Step descriptions
        await test.step('should have step descriptions for each step', async () => {
          const stepCount = await homePage.getStepCount();
          for (let i = 0; i < stepCount; i++) {
            const description = await homePage.getStepDescription(i);
            expect(description).toBeTruthy();
            expect(description.length).toBeGreaterThan(10);
            console.log(`   Step ${i+1} description: ${description.substring(0, 30)}...`);
          }
        });
      });

      // ============================================
      // 5. FEATURES SECTION TESTS
      // ============================================
      console.log('\n⭐ FEATURES SECTION TESTS');
      console.log('-' .repeat(30));

      await test.step('Features Section Tests', async () => {
        // Test 21: Feature count
        await test.step('should display 5 feature cards', async () => {
          const featureCount = await homePage.getFeatureCount();
          expect(featureCount).toBe(5);
          console.log(`✅ Feature count: ${featureCount}`);
        });

        // Test 22: Feature titles
        await test.step('should have correct feature titles', async () => {
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
            console.log(`   Feature ${i+1}: ${title}`);
          }
        });

        // Test 23: Feature descriptions
        await test.step('should have feature descriptions', async () => {
          const featureCount = await homePage.getFeatureCount();
          for (let i = 0; i < featureCount; i++) {
            const description = await homePage.getFeatureDescription(i);
            expect(description).toBeTruthy();
            expect(description.length).toBeGreaterThan(20);
            console.log(`   Feature ${i+1} description: ${description.substring(0, 30)}...`);
          }
        });

        // Test 24: Feature icons
        await test.step('should have feature icons', async () => {
          const expectedIcons = ['store', 'calendar_month', 'format_list_bulleted', 'credit_card', 'receipt_long'];
          const featureCount = await homePage.getFeatureCount();

          for (let i = 0; i < featureCount; i++) {
            const icon = await homePage.getFeatureIcon(i);
            expect(icon).toBe(expectedIcons[i]);
            console.log(`   Feature ${i+1} icon: ${icon}`);
          }
        });
      });

      // ============================================
      // 6. BOTTOM CTA TESTS
      // ============================================
      console.log('\n📢 BOTTOM CTA TESTS');
      console.log('-' .repeat(30));

      await test.step('Bottom CTA Tests', async () => {
        // Test 25: Bottom CTA visible
        await test.step('should display bottom CTA section', async () => {
          await expect(homePage.ctaBottom).toBeVisible();
          console.log('✅ Bottom CTA visible');
        });

        // Test 26: Bottom CTA title
        await test.step('should have correct bottom CTA title', async () => {
          const title = await homePage.getBottomCTATitle();
          expect(title).toBe('Készen állsz?');
          console.log(`✅ Bottom CTA title: ${title}`);
        });

        // Test 27: Bottom CTA subtitle
        await test.step('should have correct bottom CTA subtitle', async () => {
          const subtitle = await homePage.getBottomCTASubtitle();
          expect(subtitle).toContain('Regisztrálj ingyen');
          expect(subtitle).toContain('percek alatt');
          console.log(`✅ Bottom CTA subtitle: ${subtitle.substring(0, 30)}...`);
        });

        // Test 28: Bottom CTA button
        await test.step('should have visible bottom CTA button', async () => {
          await expect(homePage.ctaBottomButton).toBeVisible();
          console.log('✅ Bottom CTA button visible');
        });

        // Test 29: Bottom CTA button text
        await test.step('should have correct bottom CTA button text', async () => {
          const buttonText = await homePage.ctaBottomButton.textContent();
          expect(buttonText).toContain('Kezdjük el');
          console.log(`✅ Bottom CTA button text: ${buttonText?.trim()}`);
        });
      });

      // ============================================
      // 7. INTERACTIVE TESTS
      // ============================================
      console.log('\n🖱️ INTERACTIVE TESTS');
      console.log('-' .repeat(30));

      await test.step('Interactive Tests', async () => {
        // Test 30: CTA navigation to signup
        await test.step('should navigate to signup when clicking CTA', async () => {
          await homePage.clickGetStarted();
          await expect(page).toHaveURL(/.*signup/);
          console.log('✅ CTA navigated to signup');
          // Go back to home
          await homePage.clickNavHome();
          await page.waitForTimeout(500);
        });

        // Test 31: Login button navigation
        await test.step('should navigate to login when clicking login button', async () => {
          await homePage.clickLogin();
          await expect(page).toHaveURL(/.*login/);
          console.log('✅ Login button navigated to login');
          // Go back to home
          await homePage.clickNavHome();
          await page.waitForTimeout(500);
        });

        // Test 32: Bottom CTA navigation
        await test.step('should navigate to signup when clicking bottom CTA', async () => {
          await homePage.clickBottomCTA();
          await expect(page).toHaveURL(/.*signup/);
          console.log('✅ Bottom CTA navigated to signup');
          // Go back to home
          await homePage.clickNavHome();
          await page.waitForTimeout(500);
        });
      });
      /*
     // ============================================
// 8. DARK MODE TESTS (UPDATED)
// ============================================
console.log('\n🌙 DARK MODE TESTS');
console.log('-' .repeat(30));

await test.step('Dark Mode Tests', async () => {
  // Test 33: Ensure we start in light mode
  await test.step('should start in light mode', async () => {
    // Ensure we're in light mode before testing
    await homePage.ensureLightMode();
    
    const initialTheme = await homePage.getCurrentTheme();
    expect(initialTheme).toBe('light');
    console.log(`✅ Initial theme: ${initialTheme}`);
    
    const initialIcon = await homePage.getDarkModeIconText();
    console.log(`✅ Initial icon: ${initialIcon}`);
    // In light mode, icon should be 'dark_mode'
    expect(initialIcon).toBe('dark_mode');
  });

  // Test 34: Dark mode toggle visible
  await test.step('should have dark mode toggle visible', async () => {
    await expect(homePage.darkModeToggle).toBeVisible();
    console.log('✅ Dark mode toggle visible');
  });

  // Test 35: Toggle to dark mode
  await test.step('should toggle from light to dark mode', async () => {
    const beforeTheme = await homePage.getCurrentTheme();
    expect(beforeTheme).toBe('light');
    console.log(`   Before toggle: ${beforeTheme}`);
    
    const beforeIcon = await homePage.getDarkModeIconText();
    console.log(`   Before icon: ${beforeIcon}`);
    
    await homePage.toggleDarkMode();
    await homePage.wait(500); // Using the new wait method
    
    const afterTheme = await homePage.getCurrentTheme();
    expect(afterTheme).toBe('dark');
    console.log(`   After toggle: ${afterTheme}`);
    
    const afterIcon = await homePage.getDarkModeIconText();
    console.log(`   After icon: ${afterIcon}`);
    // In dark mode, icon should be 'light_mode'
    expect(afterIcon).toBe('light_mode');
    
    console.log('✅ Successfully toggled to dark mode');
  });

  // Test 36: Toggle back to light mode
  await test.step('should toggle from dark to light mode', async () => {
    const beforeTheme = await homePage.getCurrentTheme();
    expect(beforeTheme).toBe('dark');
    console.log(`   Before toggle: ${beforeTheme}`);
    
    const beforeIcon = await homePage.getDarkModeIconText();
    console.log(`   Before icon: ${beforeIcon}`);
    
    await homePage.toggleDarkMode();
    await homePage.wait(500); // Using the new wait method
    
    const afterTheme = await homePage.getCurrentTheme();
    expect(afterTheme).toBe('light');
    console.log(`   After toggle: ${afterTheme}`);
    
    const afterIcon = await homePage.getDarkModeIconText();
    console.log(`   After icon: ${afterIcon}`);
    // In light mode, icon should be 'dark_mode'
    expect(afterIcon).toBe('dark_mode');
    
    console.log('✅ Successfully toggled back to light mode');
  });

  // Test 37: Verify theme persists correctly
  await test.step('should maintain correct theme state', async () => {
    // Ensure we're in light mode
    await homePage.ensureLightMode();
    
    // Toggle to dark
    await homePage.toggleDarkMode();
    await homePage.wait(300); // Using the new wait method
    
    let isDark = await homePage.isDarkModeEnabled();
    expect(isDark).toBe(true);
    console.log(`   Dark mode enabled: ${isDark}`);
    
    // Toggle to light
    await homePage.toggleDarkMode();
    await homePage.wait(300); // Using the new wait method
    
    isDark = await homePage.isDarkModeEnabled();
    expect(isDark).toBe(false);
    console.log(`   Dark mode enabled: ${isDark}`);
    
    console.log('✅ Theme state maintained correctly');
  });
});
*/
      // ============================================
      // 9. MOBILE RESPONSIVE TESTS
      // ============================================
      console.log('\n📱 MOBILE RESPONSIVE TESTS');
      console.log('-' .repeat(30));

      await test.step('Mobile Responsive Tests', async () => {
        // Test 38: Mobile menu
        await test.step('should display mobile menu on smaller screens', async () => {
          await page.setViewportSize({ width: 375, height: 812 });
          await page.goto('https://staging.onebookx.com');
          await page.waitForTimeout(1000);
          await expect(homePage.mobileMenuButton).toBeVisible();
          console.log('✅ Mobile menu visible on small screen');
          // Reset viewport
          await page.setViewportSize({ width: 1280, height: 720 });
        });

        // Test 39: Desktop navigation
        await test.step('should display desktop navigation on larger screens', async () => {
          await page.setViewportSize({ width: 1280, height: 720 });
          await page.goto('https://staging.onebookx.com');
          await page.waitForTimeout(1000);
          await expect(homePage.desktopNav).toBeVisible();
          console.log('✅ Desktop navigation visible on large screen');
        });
      });

      // ============================================
      // 10. AUTHENTICATION STATE TESTS
      // ============================================
      console.log('\n🔐 AUTHENTICATION STATE TESTS');
      console.log('-' .repeat(30));

      await test.step('Authentication State Tests', async () => {
        // Test 40: Auth state loaded
        await test.step('should have authentication state loaded', async () => {
          const hasAuth = AuthHelper.hasStorageState();
          if (hasAuth) {
            console.log(`✅ Authentication state loaded for tests`);
            const authPath = AuthHelper.getStoragePath();
            console.log(`📁 Auth file: ${authPath}`);
          } else {
            console.log('ℹ️ No authentication state found - running as guest');
          }
        });

        // Test 41: Auth across test cases
        await test.step('should maintain auth across test cases', async () => {
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

      console.log('\n✅ CONSOLIDATED SMOKE TEST COMPLETE!');
      console.log('=' .repeat(50));
      
    } catch (error) {
      testFailed = true;
      console.error('❌ Test failed:', error);
      throw error;
    } finally {
      // Ensure browser context is closed even if test fails
      if (testFailed) {
        console.log('🧹 Cleaning up due to test failure...');
        // The afterEach hook will handle the cleanup
      }
    }
  });
});