import { FullConfig } from '@playwright/test';
import { AuthHelper } from './auth';
import { chromium } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('\n🔐 CHECKING AUTHENTICATION...');
  console.log('=' .repeat(40));
  
  // Check if we already have auth
  if (AuthHelper.hasStorageState()) {
    console.log('✅ Auth already exists! Using saved session.');
    console.log(`📁 Location: ${AuthHelper.getStoragePath()}`);
    return;
  }
  
  console.log('⚠️ No auth found. Starting manual login...\n');
  console.log('📝 Instructions:');
  console.log('1. Browser will open');
  console.log('2. Complete the login manually');
  console.log('3. When you see the home page, type "done" in the terminal');
  console.log('=' .repeat(40));
  console.log('');
  
  // Open browser for manual login
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the app
  await page.goto('https://staging.onebookx.com');
  
  console.log('✅ Browser is open. Please log in.');
  console.log('📝 Type "done" when you see the home page:');
  
  // Wait for user to type "done"
  const answer = await new Promise<string>((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    readline.question('> ', (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
  
  if (answer.toLowerCase() !== 'done') {
    console.log('❌ You didn\'t type "done". Exiting...');
    await browser.close();
    process.exit(1);
  }
  
  console.log('\n✅ Confirmed! Saving authentication...');
  
  // Wait for any pending requests
  await page.waitForTimeout(3000);
  
  // Save the auth state
  await AuthHelper.saveStorageState(page.context());
  
  const cookies = await page.context().cookies();
  console.log(`🍪 Saved ${cookies.length} cookies.`);
  console.log('✅ Global setup complete!');
  console.log(`📁 Location: ${AuthHelper.getStoragePath()}`);
  
  await browser.close();
}

export default globalSetup;