import { test as setup } from '@playwright/test';
import { AuthHelper } from '../utils/auth';
import { LoginPage } from '../../pages/LoginPage';

setup('authenticate (manual code)', async ({ page }) => {
  // Clear existing auth
  if (AuthHelper.hasStorageState()) {
    console.log('🗑️ Clearing existing auth...');
    AuthHelper.clearStorageState();
  }

  const loginPage = new LoginPage(page);
  const email = process.env.TEST_EMAIL || 'your-email@example.com';

  console.log('\n🔐 AUTHENTICATION SETUP');
  console.log('=' .repeat(40));
  console.log(`📧 Email: ${email}`);
  console.log('🔑 Please enter the verification code when prompted.\n');

  console.log('📧 Sending verification code...');
  await loginPage.goto();
  await loginPage.enterEmail(email);
  await loginPage.clickSendCode();
  
  console.log('✅ Code sent! Check your email.');
  console.log('📝 Enter the verification code:');
  
  // Wait for user to enter the code in terminal
  const code = await new Promise<string>((resolve) => {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('> ', (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  console.log(`\n🔑 Verifying code: ${code}...`);
  
  // Enter the verification code
  await loginPage.enterVerificationCode(code);
  await loginPage.clickVerify();
  
  // Wait for redirect to home
  await page.waitForURL('https://staging.onebookx.com/', { timeout: 10000 });
  console.log('✅ Login successful! Redirected to home.');
  
  // Wait a moment for cookies to be set
  await page.waitForTimeout(2000);
  
  // Save the auth state
  console.log('\n💾 Saving authentication state...');
  await AuthHelper.saveStorageState(page.context());
  
  const cookies = await page.context().cookies();
  console.log(`🍪 Saved ${cookies.length} cookies.`);
  console.log('✅ Authentication saved successfully!');
  console.log(`📁 Location: ${AuthHelper.getStoragePath()}`);
});