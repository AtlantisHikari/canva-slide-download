// Jest test setup file
import '@testing-library/jest-dom'

// Global test configuration
global.console = {
  ...console,
  // Suppress console logs during tests unless in debug mode
  log: process.env.DEBUG ? console.log : jest.fn(),
  warn: process.env.DEBUG ? console.warn : jest.fn(),
  error: console.error, // Always show errors
}

// Mock window.URL if not available
if (typeof window !== 'undefined' && !window.URL) {
  Object.defineProperty(window, 'URL', {
    value: URL,
    writable: true,
    configurable: true,
  })
}

// Mock fetch for API tests
global.fetch = jest.fn()

// Setup test timeout
jest.setTimeout(30000)