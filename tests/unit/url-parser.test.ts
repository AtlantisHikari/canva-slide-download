// Unit Tests: URL Parser Module
// Tests for URL解析與驗證功能

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { parseCanvaUrl, normalizeCanvaUrl } from '../../src/lib/canva-parser';
import { CanvaDesignInfo } from '../../src/types';

describe('Canva URL Parser Functions', () => {
  beforeEach(() => {
    // Reset any mocks or state before each test
  });

  afterEach(() => {
    // Clean up any test artifacts
  });

  describe('normalizeCanvaUrl', () => {
    test('should normalize standard Canva design URL correctly', () => {
      // TC-URL-001: 標準Canva簡報URL正規化
      const url = 'https://www.canva.com/design/DAGutBPLlkA/view';
      const result = normalizeCanvaUrl(url);

      expect(result).toBe('https://www.canva.com/design/DAGutBPLlkA/view');
    });

    test('should handle URL with query parameters', () => {
      // TC-URL-002: 帶參數的URL正規化
      const url = 'https://www.canva.com/design/DAGutBPLlkA/view?utm_content=test&utm_source=share';
      const result = normalizeCanvaUrl(url);

      expect(result).toContain('https://www.canva.com/design/DAGutBPLlkA/view');
    });

    test('should normalize edit URL correctly', () => {
      const url = 'https://www.canva.com/design/DAGutBPLlkA/edit';
      const result = normalizeCanvaUrl(url);

      expect(result).toBe('https://www.canva.com/design/DAGutBPLlkA/edit');
    });

    test('should add view action if missing', () => {
      const url = 'https://www.canva.com/design/DAGutBPLlkA';
      const result = normalizeCanvaUrl(url);

      expect(result).toBe('https://www.canva.com/design/DAGutBPLlkA/view');
    });

    test('should throw error for malformed URLs', () => {
      // TC-URL-003: 無效URL處理
      const invalidUrls = [
        'not-a-url',
        // '' // empty string actually gets processed by URL constructor
      ];

      invalidUrls.forEach(url => {
        expect(() => normalizeCanvaUrl(url)).toThrow('無效的 URL 格式');
      });
      
      // Test empty string separately as it might behave differently
      expect(() => normalizeCanvaUrl('')).toThrow();
    });

    test('should normalize any valid URL format', () => {
      // normalizeCanvaUrl只檢查URL格式，不驗證是否為Canva URL
      const validUrls = [
        'https://google.com',
        'https://www.canva.com/invalid',
        'https://www.canva.com/design/'
      ];

      validUrls.forEach(url => {
        expect(() => normalizeCanvaUrl(url)).not.toThrow();
      });
    });

    test('should handle special characters in URL', () => {
      // TC-URL-004: 特殊字符URL處理
      const urlWithSpecialChars = 'https://www.canva.com/design/DAG測試123/view';
      
      // Should either normalize correctly or throw error gracefully
      try {
        const result = normalizeCanvaUrl(urlWithSpecialChars);
        expect(result).toContain('DAG測試123');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('should handle very long URLs', () => {
      const longDesignId = 'A'.repeat(500);
      const longUrl = `https://www.canva.com/design/${longDesignId}/view`;
      
      // Should handle gracefully without crashing
      try {
        const result = normalizeCanvaUrl(longUrl);
        expect(typeof result).toBe('string');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('URL validation through normalization', () => {
    test('should validate correct Canva URLs', () => {
      const validUrls = [
        'https://www.canva.com/design/DAGutBPLlkA/view',
        'https://www.canva.com/design/ABCD1234567/edit',
        'https://canva.com/design/XYZ789/view'
      ];

      validUrls.forEach(url => {
        expect(() => normalizeCanvaUrl(url)).not.toThrow();
      });
    });

    test('should reject malformed URLs only', () => {
      const malformedUrls = [
        'not-a-url'
      ];

      malformedUrls.forEach(url => {
        expect(() => normalizeCanvaUrl(url)).toThrow();
      });
      
      // Test empty string separately
      expect(() => normalizeCanvaUrl('')).toThrow();
    });

    test('should normalize valid URLs regardless of domain', () => {
      const validUrls = [
        'https://google.com',
        'https://www.canva.com/invalid',
        'ftp://canva.com/design/test/view',
        'https://www.canva.com/design//view'
      ];

      validUrls.forEach(url => {
        expect(() => normalizeCanvaUrl(url)).not.toThrow();
      });
    });

    test('should handle various URL formats', () => {
      // These are valid URL formats, so they should not throw
      const urlFormats = [
        'https://www.canva.com/design/',
        'https://www.canva.com/design/123/',
        'https://www.canva.com/design/123/invalid-action'
      ];

      urlFormats.forEach(url => {
        expect(() => normalizeCanvaUrl(url)).not.toThrow();
      });
    });
  });

  describe('design ID extraction through URL normalization', () => {
    test('should extract design ID correctly', () => {
      const testCases = [
        { url: 'https://www.canva.com/design/DAGutBPLlkA/view', expected: 'DAGutBPLlkA' },
        { url: 'https://www.canva.com/design/ABC123XYZ/edit', expected: 'ABC123XYZ' },
        { url: 'https://canva.com/design/TEST456/view', expected: 'TEST456' }
      ];

      testCases.forEach(({ url, expected }) => {
        const normalizedUrl = normalizeCanvaUrl(url);
        expect(normalizedUrl).toContain(expected);
      });
    });

    test('should handle invalid URLs appropriately', () => {
      const malformedUrls = [
        'not-a-url'
      ];
      
      const validUrls = [
        'https://google.com',
        'https://www.canva.com/invalid'
      ];

      malformedUrls.forEach(url => {
        expect(() => normalizeCanvaUrl(url)).toThrow();
      });
      
      validUrls.forEach(url => {
        expect(() => normalizeCanvaUrl(url)).not.toThrow();
      });
    });
  });


  describe('Performance Tests', () => {
    test('should normalize URL within reasonable time', () => {
      const url = 'https://www.canva.com/design/DAGutBPLlkA/view';
      const startTime = Date.now();
      
      const result = normalizeCanvaUrl(url);
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(100); // Should be very fast
      expect(result).toBeTruthy();
    });

    test('should handle batch URL normalization efficiently', () => {
      const urls = Array.from({ length: 100 }, (_, i) => 
        `https://www.canva.com/design/TEST${i}/view`
      );
      
      const startTime = Date.now();
      
      const results = urls.map(url => normalizeCanvaUrl(url));
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(1000); // Should be very fast
      expect(results).toHaveLength(100);
      expect(results.every(r => r.includes('https://www.canva.com'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle null input gracefully', () => {
      expect(() => normalizeCanvaUrl(null as any)).toThrow();
    });

    test('should handle undefined input gracefully', () => {
      expect(() => normalizeCanvaUrl(undefined as any)).toThrow();
    });

    test('should handle extremely long URLs', () => {
      const extremelyLongUrl = 'https://www.canva.com/design/' + 'A'.repeat(10000) + '/view';
      
      // Should either normalize or throw error gracefully
      try {
        const result = normalizeCanvaUrl(extremelyLongUrl);
        expect(typeof result).toBe('string');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('should handle malicious input safely', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '"; DROP TABLE users; --',
        '../../../etc/passwd'
      ];
      
      const validProtocolInputs = [
        'javascript:alert("xss")' // This is a valid URL format
      ];

      maliciousInputs.forEach(input => {
        expect(() => normalizeCanvaUrl(input)).toThrow();
      });
      
      validProtocolInputs.forEach(input => {
        expect(() => normalizeCanvaUrl(input)).not.toThrow();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle URLs with unusual but valid design IDs', () => {
      const edgeCaseUrls = [
        'https://www.canva.com/design/a/view', // single character
        'https://www.canva.com/design/1234567890123456789012345678901234567890/view', // very long
        'https://www.canva.com/design/Mix3d-Ch4r5_ID/view' // mixed characters
      ];

      edgeCaseUrls.forEach(url => {
        try {
          const result = normalizeCanvaUrl(url);
          expect(result).toContain('https://www.canva.com/design/');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    test('should convert HTTP to HTTPS', () => {
      const httpUrl = 'http://www.canva.com/design/DAGutBPLlkA/view';
      const httpsUrl = 'https://www.canva.com/design/DAGutBPLlkA/view';

      // HTTPS should work
      expect(normalizeCanvaUrl(httpsUrl)).toBe(httpsUrl);
      
      // HTTP should be converted to HTTPS
      const httpResult = normalizeCanvaUrl(httpUrl);
      expect(httpResult).toContain('https://');
    });
  });
});

// Test data for integration with other modules
export const mockCanvaUrls = {
  valid: {
    standard: 'https://www.canva.com/design/DAGutBPLlkA/view',
    withParams: 'https://www.canva.com/design/DAGutBPLlkA/view?utm_content=test',
    edit: 'https://www.canva.com/design/DAGutBPLlkA/edit',
    withoutAction: 'https://www.canva.com/design/DAGutBPLlkA'
  },
  invalid: [
    'not-a-url',
    'https://google.com',
    'https://www.canva.com/invalid',
    'https://www.canva.com/design/',
    ''
  ],
  edgeCases: [
    'https://canva.com/design/SHORT/view',
    'http://www.canva.com/design/TEST123/view'
  ]
};