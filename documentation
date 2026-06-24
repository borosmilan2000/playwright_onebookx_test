================================================================================
                    ONEB00KX E2E TEST AUTOMATION FRAMEWORK
                                Complete Documentation
================================================================================

TABLE OF CONTENTS
=================
1. Project Overview
2. Prerequisites
3. Installation & Setup
4. Project Structure
5. Page Object Model
6. Utilities & Helpers
7. Test Execution
8. Configuration
9. Writing Tests
10. Best Practices
11. Troubleshooting
12. Quick Reference


================================================================================
1. PROJECT OVERVIEW
================================================================================

This repository contains end-to-end (E2E) test automation for the Onebookx 
application using Playwright. The test suite covers critical user journeys, 
UI elements, and functionality across the application including:

- Page load and rendering
- Navigation flows
- User authentication
- Dark mode functionality
- Responsive design
- Feature validation
- Interactive elements


================================================================================
2. PREREQUISITES
================================================================================

Before setting up the project, ensure you have the following installed:

Node.js (v16 or higher):
  node --version

npm (v8 or higher):
  npm --version

Git:
  git --version


================================================================================
3. INSTALLATION & SETUP
================================================================================

STEP 1: Initialize Playwright
-----------------------------
Run the following command to set up Playwright in your project:

npm init playwright@latest

You will be prompted with several questions:
  ✔ Where to put your end-to-end tests? · tests
  ✔ Add a GitHub Actions workflow? · false
  ✔ Install Playwright browsers? · true

STEP 2: Project Structure Setup
-------------------------------
After initialization, create the following folder structure:

onebookx-tests/
├── tests/
│   ├── pages/
│   │   ├── BasePage.ts
│   │   └── HomePage.ts
│   ├── utils/
│   │   └── auth.ts
│   ├── smoke_temp.spec.ts
│   └── example.spec.ts
├── playwright.config.ts
├── package.json
├── .env
├── .gitignore
└── README.md

STEP 3: Install Additional Dependencies
---------------------------------------
npm install --save-dev @playwright/test dotenv

STEP 4: Environment Configuration
----------------------------------
Create a .env file in the root directory:

# Application URLs
BASE_URL=https://staging.onebookx.com

# Authentication
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=yourpassword

# Test Configuration
TIMEOUT=30000
RETRY_COUNT=2

STEP 5: Configure Playwright
----------------------------
Update playwright.config.ts:

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://staging.onebookx.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});


================================================================================
4. PROJECT STRUCTURE
================================================================================

Directory Structure:
--------------------
onebookx-tests/
│
├── tests/                          # Test files
│   ├── pages/                      # Page Object Models
│   │   ├── BasePage.ts            # Base page with common elements
│   │   └── HomePage.ts            # Home page specific elements/actions
│   │
│   ├── utils/                      # Utility/Helper functions
│   │   └── auth.ts                # Authentication helpers
│   │
│   ├── smoke_temp.spec.ts         # Main smoke test suite
│   └── example.spec.ts            # Example test file
│
├── playwright.config.ts            # Playwright configuration
├── package.json                    # Project dependencies
├── .env                           # Environment variables
├── .gitignore                     # Git ignore file
├── test-results/                  # Test results (generated)
├── playwright-report/             # HTML report (generated)
└── README.md                      # Project documentation

File Descriptions:
------------------
BasePage.ts       - Base class with common elements and methods shared across all pages
HomePage.ts       - Home page specific locators and actions
auth.ts           - Authentication utilities for login, session management
smoke_temp.spec.ts - Consolidated smoke test suite
playwright.config.ts - Playwright configuration file


================================================================================
7. TEST EXECUTION
================================================================================

Running Tests
-------------
Run all tests:
  npm test
  npx playwright test

Run specific test file:
  npx playwright test smoke_temp.spec.ts

Run tests with specific browser:
  npx playwright test --project=chromium
  npx playwright test --project=firefox
  npx playwright test --project=webkit

Run tests in headed mode:
  npx playwright test --headed

Run tests with specific tag:
  npx playwright test --grep @smoke

Debug mode:
  npx playwright test --debug

Viewing Test Reports
--------------------
HTML Report:
  npx playwright show-report

JSON Report:
  cat test-results.json

Test Output Example:
--------------------
🚀 STARTING CONSOLIDATED SMOKE TEST
==================================================

📄 PAGE LOAD TESTS
------------------------------
✅ Home page loaded successfully
✅ Brand name: onebookx
✅ All main sections visible

🎯 HERO SECTION TESTS
------------------------------
✅ Badge text: Egyszerű. Gyors. Automatikus.
✅ Hero title: Saját foglalási oldal...
✅ CTA buttons visible


================================================================================
8. CONFIGURATION
================================================================================

playwright.config.ts
--------------------
Key configuration options:

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://staging.onebookx.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});

package.json Scripts
--------------------
Add these scripts to your package.json:

{
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:debug": "npx playwright test --debug",
    "test:chromium": "npx playwright test --project=chromium",
    "test:firefox": "npx playwright test --project=firefox",
    "test:webkit": "npx playwright test --project=webkit",
    "test:smoke": "npx playwright test smoke_temp.spec.ts",
    "report": "npx playwright show-report",
    "codegen": "npx playwright codegen https://staging.onebookx.com"
  }
}
