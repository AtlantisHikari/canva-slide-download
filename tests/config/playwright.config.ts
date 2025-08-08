// Playwright Configuration for E2E Testing
// 端到端測試完整配置

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory
  testDir: '../e2e',
  
  // Output directory for test artifacts
  outputDir: '../results/e2e-results',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: [
    ['html', { outputFolder: '../results/playwright-report' }],
    ['json', { outputFile: '../results/test-results.json' }],
    ['junit', { outputFile: '../results/junit-results.xml' }],
    ['line'],
    ...(process.env.CI ? [['github']] : [])
  ],

  // Global test timeout
  timeout: 60000, // 60 seconds per test

  // Global expect timeout
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },

  // Shared settings for all the projects below.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: process.env.BASE_URL || 'http://localhost:3001',

    // Browser context options
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional Chrome-specific settings
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-dev-shm-usage'
          ]
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox-specific settings
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.streams.fake': true,
            'media.navigator.permission.disabled': true,
          }
        }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // Safari-specific settings
      },
    },

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
      },
    },

    // Edge testing
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    },

    // Tablet testing
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
      },
    },

    // High DPI testing
    {
      name: 'High DPI',
      use: {
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 2,
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Performance testing profile
    {
      name: 'Performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-features=NetworkService',
            '--force-color-profile=srgb',
          ]
        }
      },
      testMatch: /.*performance\.spec\.ts/,
    },

    // Accessibility testing profile
    {
      name: 'Accessibility',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*accessibility\.spec\.ts/,
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('../helpers/global-setup.ts'),
  globalTeardown: require.resolve('../helpers/global-teardown.ts'),

  // Test-specific setup
  testIgnore: [
    // Ignore tests in development
    ...(process.env.NODE_ENV === 'development' ? ['**/*performance*'] : []),
    // Ignore slow tests in CI fast mode
    ...(process.env.FAST_CI ? ['**/*slow*', '**/*stress*'] : [])
  ],

  // Web server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_TEST_MODE: 'true'
    }
  },

  // Test metadata
  metadata: {
    'test-type': 'e2e',
    'application': 'canva-slide-download',
    'version': process.env.npm_package_version || '1.0.0',
    'environment': process.env.NODE_ENV || 'test',
    'ci': process.env.CI || 'false'
  },

  // Test configuration by file patterns
  testMatch: [
    '**/*.spec.ts',
    '**/*.e2e.ts',
    '**/*test*.ts'
  ],

  // Grep patterns for selective test running
  grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,
  grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined,

  // Maximum failures before stopping
  maxFailures: process.env.CI ? 10 : undefined,

  // Preserve output on success
  preserveOutput: process.env.CI ? 'failures-only' : 'always',

  // Update snapshots
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true' ? 'all' : 'missing',

  // Test artifacts retention
  outputDir: '../results/test-artifacts',
  
  // Custom test annotations
  testIdAttribute: 'data-testid',

  // Experimental features
  experimentalCTSupportMode: true,
});

// Environment-specific configurations
export const environments = {
  development: {
    baseURL: 'http://localhost:3001',
    timeout: 30000,
    retries: 0,
    workers: 1
  },
  staging: {
    baseURL: 'https://staging-canva-download.vercel.app',
    timeout: 60000,
    retries: 1,
    workers: 2
  },
  production: {
    baseURL: 'https://canva-download.vercel.app',
    timeout: 90000,
    retries: 2,
    workers: 3
  }
};

// Test categories configuration
export const testCategories = {
  smoke: {
    // Quick smoke tests for basic functionality
    testMatch: ['**/smoke/*.spec.ts'],
    timeout: 30000,
    retries: 0
  },
  regression: {
    // Comprehensive regression tests
    testMatch: ['**/regression/*.spec.ts'],
    timeout: 60000,
    retries: 1
  },
  performance: {
    // Performance and load tests
    testMatch: ['**/performance/*.spec.ts'],
    timeout: 300000, // 5 minutes
    retries: 0,
    workers: 1 // Sequential execution for accurate measurement
  },
  accessibility: {
    // Accessibility compliance tests
    testMatch: ['**/accessibility/*.spec.ts'],
    timeout: 45000,
    retries: 1
  },
  security: {
    // Security vulnerability tests
    testMatch: ['**/security/*.spec.ts'],
    timeout: 60000,
    retries: 0
  }
};

// Browser-specific test configurations
export const browserConfigs = {
  chromium: {
    // Chrome DevTools Protocol features
    use: {
      launchOptions: {
        args: [
          '--enable-logging=stderr',
          '--v=1',
          '--enable-features=NetworkService'
        ]
      }
    }
  },
  firefox: {
    // Firefox-specific features
    use: {
      launchOptions: {
        firefoxUserPrefs: {
          'dom.webnotifications.enabled': false,
          'dom.push.enabled': false
        }
      }
    }
  },
  webkit: {
    // Safari-specific features
    use: {
      launchOptions: {
        // WebKit specific options
      }
    }
  }
};

// Performance monitoring configuration
export const performanceConfig = {
  // Metrics to collect
  metrics: [
    'firstContentfulPaint',
    'largestContentfulPaint',
    'cumulativeLayoutShift',
    'totalBlockingTime',
    'speedIndex'
  ],
  
  // Performance budgets
  budgets: {
    firstContentfulPaint: 2000,    // 2 seconds
    largestContentfulPaint: 4000,  // 4 seconds
    cumulativeLayoutShift: 0.1,    // 0.1 CLS score
    totalBlockingTime: 300,        // 300ms
    speedIndex: 3000               // 3 seconds
  },
  
  // Network conditions for testing
  networkConditions: {
    slow3G: {
      downloadThroughput: 500 * 1024,      // 500 KB/s
      uploadThroughput: 500 * 1024,        // 500 KB/s
      latency: 400                         // 400ms
    },
    regular4G: {
      downloadThroughput: 4 * 1024 * 1024, // 4 MB/s
      uploadThroughput: 3 * 1024 * 1024,   // 3 MB/s
      latency: 20                          // 20ms
    }
  }
};

// Accessibility testing configuration
export const accessibilityConfig = {
  // axe-core rules to test
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'semantic-markup': { enabled: true }
  },
  
  // WCAG compliance level
  wcagLevel: 'AA',
  
  // Standards to test against
  standards: ['WCAG2A', 'WCAG2AA', 'Section508']
};