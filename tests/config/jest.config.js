// Jest Configuration for Canva Slide Download System
// 完整的Jest測試框架配置

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test environment setup
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/config/test-setup.ts'],
  
  // Module name mapping for path aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
  },

  // Test patterns
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{js,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,ts,tsx}'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/performance/'
  ],

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.{js,ts,tsx}',
    '!src/**/*.config.{js,ts}',
    '!src/types/**/*',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Per-file thresholds for critical modules
    './src/lib/url-parser.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/lib/screenshot-engine.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/lib/pdf-generator.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'clover'
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Test timeout
  testTimeout: 30000, // 30 seconds for integration tests

  // Globals
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Reset modules before each test
  resetModules: true,

  // Test result processor
  testResultsProcessor: '<rootDir>/tests/config/test-results-processor.js',

  // Custom reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Canva Slide Download - Test Report'
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage/junit',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Error on deprecated features
  errorOnDeprecated: true,

  // Force exit after tests complete
  forceExit: false,

  // Detect leaks
  detectLeaks: process.env.NODE_ENV === 'test',

  // Max workers for parallel testing
  maxWorkers: process.env.CI ? 2 : '50%',

  // Cache directory
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // Snapshot serializers
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3001/canva-slide-download'
  },

  // Custom test environment variables
  setupFiles: ['<rootDir>/tests/config/test-env.ts'],

  // Mock configuration
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/.next/'
  ],

  // Transformer ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(some-esm-package|another-esm-package)/)'
  ],

  // Notify configuration
  notify: false,
  notifyMode: 'failure-change',

  // Bail configuration - stop on first failure in CI
  bail: process.env.CI ? 1 : 0,

  // Silent mode for CI
  silent: process.env.CI ? true : false,

  // Custom matchers and utilities
  modulePaths: ['<rootDir>/tests/helpers'],

  // Performance monitoring
  maxConcurrency: 5,

  // Timeout for individual tests
  slowTestThreshold: 5, // seconds

  // Test name pattern
  testNamePattern: process.env.TEST_NAME_PATTERN,

  // Shard configuration for parallel execution
  shard: process.env.JEST_SHARD ? JSON.parse(process.env.JEST_SHARD) : undefined,
};

// Create and export the Jest configuration
module.exports = createJestConfig(customJestConfig);

// Export test utilities
module.exports.testUtils = {
  // Custom test timeout for different test types
  timeouts: {
    unit: 5000,        // 5 seconds
    integration: 15000, // 15 seconds
    api: 30000,        // 30 seconds
    performance: 60000  // 60 seconds
  },

  // Test data paths
  fixtures: {
    mockData: '<rootDir>/tests/fixtures',
    testImages: '<rootDir>/tests/fixtures/images',
    testUrls: '<rootDir>/tests/fixtures/urls.json'
  },

  // Environment-specific settings
  environments: {
    development: {
      apiUrl: 'http://localhost:3001',
      timeout: 30000
    },
    test: {
      apiUrl: 'http://localhost:3002',
      timeout: 60000
    },
    ci: {
      apiUrl: 'http://localhost:3003',
      timeout: 120000
    }
  },

  // Test categories
  categories: {
    smoke: 'Basic functionality tests',
    regression: 'Regression prevention tests',
    performance: 'Performance benchmark tests',
    security: 'Security vulnerability tests',
    accessibility: 'Accessibility compliance tests'
  },

  // Mock configurations
  mocks: {
    puppeteer: true,
    canvaApi: true,
    fileSystem: true,
    network: process.env.MOCK_NETWORK === 'true'
  }
};