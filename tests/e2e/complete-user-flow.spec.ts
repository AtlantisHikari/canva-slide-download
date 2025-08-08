// E2E Tests: Complete User Flow
// Tests for 端到端完整用戶流程測試

import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Complete User Flow E2E Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    
    // Navigate to the application
    await page.goto('http://localhost:3001/canva-slide-download');
    
    // Wait for app to load
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });

  test.afterEach(async () => {
    await context.close();
  });

  test.describe('Basic Download Flow', () => {
    test('should complete full download process successfully', async () => {
      // TC-E2E-001: 完整下載流程端到端測試
      
      // Step 1: Input valid Canva URL
      const urlInput = page.locator('[data-testid="url-input"]');
      await expect(urlInput).toBeVisible();
      await urlInput.fill('https://www.canva.com/design/DAGutBPLlkA/view');

      // Step 2: Validate URL automatically
      await expect(page.locator('[data-testid="url-status"]')).toContainText('Valid URL');

      // Step 3: Configure download settings
      await page.locator('[data-testid="resolution-select"]').selectOption('1080p');
      await page.locator('[data-testid="format-select"]').selectOption('pdf');
      await page.locator('[data-testid="quality-select"]').selectOption('high');

      // Step 4: Start download
      const downloadButton = page.locator('[data-testid="download-button"]');
      await expect(downloadButton).toBeEnabled();
      await downloadButton.click();

      // Step 5: Monitor progress
      const progressBar = page.locator('[data-testid="progress-bar"]');
      await expect(progressBar).toBeVisible();
      
      // Wait for progress to start
      await expect(progressBar).toHaveAttribute('value', '0', { timeout: 1000 });
      
      // Wait for completion (with generous timeout for actual processing)
      await expect(progressBar).toHaveAttribute('value', '100', { timeout: 60000 });

      // Step 6: Verify download completion
      const downloadLink = page.locator('[data-testid="download-link"]');
      await expect(downloadLink).toBeVisible();
      await expect(downloadLink).toContainText('Download PDF');

      // Step 7: Verify download metadata
      const metadata = page.locator('[data-testid="download-metadata"]');
      await expect(metadata).toContainText('Pages:');
      await expect(metadata).toContainText('Size:');
      await expect(metadata).toContainText('Resolution: 1080p');
    });

    test('should handle invalid URL gracefully', async () => {
      // TC-E2E-002: 無效URL錯誤處理
      
      const urlInput = page.locator('[data-testid="url-input"]');
      await urlInput.fill('https://invalid-url.com');

      // Should show error message
      await expect(page.locator('[data-testid="url-error"]')).toContainText('Invalid URL');
      
      // Download button should be disabled
      const downloadButton = page.locator('[data-testid="download-button"]');
      await expect(downloadButton).toBeDisabled();
    });

    test('should validate different URL formats', async () => {
      // TC-E2E-003: 不同URL格式驗證
      
      const validUrls = [
        'https://www.canva.com/design/DAGutBPLlkA/view',
        'https://canva.com/design/DAGutBPLlkA/edit',
        'https://www.canva.com/design/DAGutBPLlkA/share/preview'
      ];

      for (const url of validUrls) {
        const urlInput = page.locator('[data-testid="url-input"]');
        await urlInput.clear();
        await urlInput.fill(url);
        
        // Should validate successfully
        await expect(page.locator('[data-testid="url-status"]')).toContainText('Valid URL');
        
        // Download button should be enabled
        await expect(page.locator('[data-testid="download-button"]')).toBeEnabled();
      }
    });
  });

  test.describe('Download Settings Configuration', () => {
    test('should configure different resolution options', async () => {
      // TC-E2E-004: 解析度選項配置
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/DAGutBPLlkA/view');
      
      const resolutions = ['480p', '720p', '1080p', '4K'];
      
      for (const resolution of resolutions) {
        await page.locator('[data-testid="resolution-select"]').selectOption(resolution);
        
        // Verify selection
        const selectedValue = await page.locator('[data-testid="resolution-select"]').inputValue();
        expect(selectedValue).toBe(resolution);
        
        // Check if 4K shows performance warning
        if (resolution === '4K') {
          await expect(page.locator('[data-testid="performance-warning"]')).toBeVisible();
        }
      }
    });

    test('should configure quality settings', async () => {
      // TC-E2E-005: 品質設定配置
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/DAGutBPLlkA/view');
      
      const qualities = ['low', 'medium', 'high', 'maximum'];
      
      for (const quality of qualities) {
        await page.locator('[data-testid="quality-select"]').selectOption(quality);
        
        const selectedValue = await page.locator('[data-testid="quality-select"]').inputValue();
        expect(selectedValue).toBe(quality);
      }
    });

    test('should show estimated processing time', async () => {
      // TC-E2E-006: 預估處理時間顯示
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/DAGutBPLlkA/view');
      
      // Configure settings
      await page.locator('[data-testid="resolution-select"]').selectOption('4K');
      await page.locator('[data-testid="quality-select"]').selectOption('maximum');
      
      // Should show estimated time
      const estimatedTime = page.locator('[data-testid="estimated-time"]');
      await expect(estimatedTime).toBeVisible();
      await expect(estimatedTime).toContainText('Estimated time:');
    });
  });

  test.describe('Batch Download Flow', () => {
    test('should handle multiple URLs in batch', async () => {
      // TC-E2E-007: 批次下載流程
      
      // Switch to batch mode
      await page.locator('[data-testid="batch-mode-toggle"]').click();
      
      const urls = [
        'https://www.canva.com/design/TEST1/view',
        'https://www.canva.com/design/TEST2/view',
        'https://www.canva.com/design/TEST3/view'
      ];
      
      // Add URLs to batch
      for (let i = 0; i < urls.length; i++) {
        if (i > 0) {
          await page.locator('[data-testid="add-url-button"]').click();
        }
        
        const urlInput = page.locator(`[data-testid="batch-url-${i}"]`);
        await urlInput.fill(urls[i]);
        
        // Verify URL validation
        await expect(page.locator(`[data-testid="batch-status-${i}"]`)).toContainText('Valid');
      }
      
      // Configure batch settings
      await page.locator('[data-testid="batch-resolution"]').selectOption('1080p');
      await page.locator('[data-testid="batch-format"]').selectOption('pdf');
      
      // Start batch download
      await page.locator('[data-testid="batch-download-button"]').click();
      
      // Monitor batch progress
      const batchProgress = page.locator('[data-testid="batch-progress"]');
      await expect(batchProgress).toBeVisible();
      
      // Wait for completion
      await expect(page.locator('[data-testid="batch-complete"]')).toBeVisible({ timeout: 120000 });
      
      // Verify all downloads completed
      for (let i = 0; i < urls.length; i++) {
        const downloadLink = page.locator(`[data-testid="batch-download-${i}"]`);
        await expect(downloadLink).toBeVisible();
      }
    });

    test('should handle batch with mixed valid/invalid URLs', async () => {
      // TC-E2E-008: 批次下載混合URL處理
      
      await page.locator('[data-testid="batch-mode-toggle"]').click();
      
      const mixedUrls = [
        'https://www.canva.com/design/VALID1/view',
        'invalid-url',
        'https://www.canva.com/design/VALID2/view'
      ];
      
      // Add mixed URLs
      for (let i = 0; i < mixedUrls.length; i++) {
        if (i > 0) {
          await page.locator('[data-testid="add-url-button"]').click();
        }
        
        await page.locator(`[data-testid="batch-url-${i}"]`).fill(mixedUrls[i]);
      }
      
      // Start batch download
      await page.locator('[data-testid="batch-download-button"]').click();
      
      // Wait for completion
      await expect(page.locator('[data-testid="batch-complete"]')).toBeVisible({ timeout: 60000 });
      
      // Verify results
      await expect(page.locator('[data-testid="batch-result-0"]')).toContainText('Success');
      await expect(page.locator('[data-testid="batch-result-1"]')).toContainText('Failed');
      await expect(page.locator('[data-testid="batch-result-2"]')).toContainText('Success');
    });

    test('should allow batch queue management', async () => {
      // TC-E2E-009: 批次佇列管理
      
      await page.locator('[data-testid="batch-mode-toggle"]').click();
      
      // Add multiple URLs
      const urls = Array.from({ length: 5 }, (_, i) => 
        `https://www.canva.com/design/TEST${i}/view`
      );
      
      for (let i = 0; i < urls.length; i++) {
        if (i > 0) {
          await page.locator('[data-testid="add-url-button"]').click();
        }
        await page.locator(`[data-testid="batch-url-${i}"]`).fill(urls[i]);
      }
      
      // Test reordering
      await page.locator('[data-testid="move-up-2"]').click();
      
      // Test removal
      await page.locator('[data-testid="remove-url-1"]').click();
      
      // Verify queue state
      const remainingUrls = await page.locator('[data-testid^="batch-url-"]').count();
      expect(remainingUrls).toBe(4);
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle network connection errors', async () => {
      // TC-E2E-010: 網路錯誤處理
      
      // Simulate network offline
      await context.setOffline(true);
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/DAGutBPLlkA/view');
      await page.locator('[data-testid="download-button"]').click();
      
      // Should show network error
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
      
      // Restore connection
      await context.setOffline(false);
      
      // Retry should work
      await page.locator('[data-testid="retry-button"]').click();
      
      // Should start processing again
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    });

    test('should handle timeout gracefully', async () => {
      // TC-E2E-011: 超時處理
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/TIMEOUT_TEST/view');
      await page.locator('[data-testid="download-button"]').click();
      
      // Should show timeout error after reasonable time
      await expect(page.locator('[data-testid="error-message"]')).toContainText('timeout', { timeout: 65000 });
      
      // Should offer retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should handle private presentation access', async () => {
      // TC-E2E-012: 私人簡報存取處理
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/PRIVATE123/view');
      await page.locator('[data-testid="download-button"]').click();
      
      // Should show access denied error
      await expect(page.locator('[data-testid="error-message"]')).toContainText('private presentation');
      
      // Should provide helpful instructions
      await expect(page.locator('[data-testid="help-text"]')).toContainText('sharing settings');
    });
  });

  test.describe('User Interface and Experience', () => {
    test('should be responsive on different screen sizes', async () => {
      // TC-E2E-013: 響應式設計測試
      
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        // Main elements should be visible and functional
        await expect(page.locator('[data-testid="url-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="download-button"]')).toBeVisible();
        
        // Navigation should work on mobile
        if (viewport.width < 768) {
          await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        }
      }
    });

    test('should provide clear progress feedback', async () => {
      // TC-E2E-014: 進度反饋測試
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/DAGutBPLlkA/view');
      await page.locator('[data-testid="download-button"]').click();
      
      // Should show immediate feedback
      await expect(page.locator('[data-testid="status-message"]')).toContainText('Starting');
      
      // Progress bar should appear
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
      
      // Should show stage information
      await expect(page.locator('[data-testid="current-stage"]')).toBeVisible();
      
      // Should show estimated time remaining
      await expect(page.locator('[data-testid="time-remaining"]')).toBeVisible();
    });

    test('should support keyboard navigation', async () => {
      // TC-E2E-015: 鍵盤導航測試
      
      // Tab through interface
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="url-input"]')).toBeFocused();
      
      // Type URL
      await page.keyboard.type('https://www.canva.com/design/DAGutBPLlkA/view');
      
      // Continue tabbing
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="resolution-select"]')).toBeFocused();
      
      // Change selection with arrow keys
      await page.keyboard.press('ArrowDown');
      
      // Tab to download button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="download-button"]')).toBeFocused();
      
      // Activate with Enter
      await page.keyboard.press('Enter');
      
      // Should start download
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    });

    test('should persist user preferences', async () => {
      // TC-E2E-016: 用戶偏好設定持久化
      
      // Set preferences
      await page.locator('[data-testid="resolution-select"]').selectOption('4K');
      await page.locator('[data-testid="quality-select"]').selectOption('maximum');
      
      // Reload page
      await page.reload();
      
      // Preferences should be restored
      const resolution = await page.locator('[data-testid="resolution-select"]').inputValue();
      const quality = await page.locator('[data-testid="quality-select"]').inputValue();
      
      expect(resolution).toBe('4K');
      expect(quality).toBe('maximum');
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle large presentations efficiently', async () => {
      // TC-E2E-017: 大型簡報處理性能
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/LARGE_PRESENTATION/view');
      await page.locator('[data-testid="resolution-select"]').selectOption('1080p');
      
      const startTime = Date.now();
      await page.locator('[data-testid="download-button"]').click();
      
      // Wait for completion
      await expect(page.locator('[data-testid="download-link"]')).toBeVisible({ timeout: 300000 }); // 5 minutes
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(processingTime).toBeLessThan(300000); // 5 minutes
      
      // Check memory usage indicator
      const memoryUsage = page.locator('[data-testid="memory-usage"]');
      if (await memoryUsage.isVisible()) {
        const memoryText = await memoryUsage.textContent();
        expect(memoryText).not.toContain('High memory usage warning');
      }
    });

    test('should maintain UI responsiveness during processing', async () => {
      // TC-E2E-018: 處理期間UI響應性
      
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/DAGutBPLlkA/view');
      await page.locator('[data-testid="download-button"]').click();
      
      // UI should remain responsive during processing
      await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible();
      
      // Should be able to interact with settings
      await page.locator('[data-testid="settings-button"]').click();
      await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible();
      
      // Should be able to switch tabs
      await page.locator('[data-testid="history-tab"]').click();
      await expect(page.locator('[data-testid="history-panel"]')).toBeVisible();
    });
  });

  test.describe('Download History and Management', () => {
    test('should maintain download history', async () => {
      // TC-E2E-019: 下載歷史記錄
      
      // Complete a download
      await page.locator('[data-testid="url-input"]').fill('https://www.canva.com/design/DAGutBPLlkA/view');
      await page.locator('[data-testid="download-button"]').click();
      await expect(page.locator('[data-testid="download-link"]')).toBeVisible({ timeout: 60000 });
      
      // Check history
      await page.locator('[data-testid="history-tab"]').click();
      
      // Should show download record
      await expect(page.locator('[data-testid="history-item-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="history-item-0"]')).toContainText('DAGutBPLlkA');
      
      // Should allow re-download
      await page.locator('[data-testid="redownload-0"]').click();
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    });

    test('should allow history management', async () => {
      // TC-E2E-020: 歷史記錄管理
      
      // Ensure there's history data
      await page.locator('[data-testid="history-tab"]').click();
      
      // Should be able to clear individual items
      if (await page.locator('[data-testid="delete-history-0"]').isVisible()) {
        await page.locator('[data-testid="delete-history-0"]').click();
        await page.locator('[data-testid="confirm-delete"]').click();
      }
      
      // Should be able to clear all history
      if (await page.locator('[data-testid="clear-all-history"]').isVisible()) {
        await page.locator('[data-testid="clear-all-history"]').click();
        await page.locator('[data-testid="confirm-clear-all"]').click();
        
        await expect(page.locator('[data-testid="empty-history"]')).toBeVisible();
      }
    });
  });
});

// Utility functions for E2E tests
export async function waitForDownloadToComplete(page: Page, timeout = 60000) {
  await expect(page.locator('[data-testid="download-link"]')).toBeVisible({ timeout });
}

export async function fillBatchUrls(page: Page, urls: string[]) {
  for (let i = 0; i < urls.length; i++) {
    if (i > 0) {
      await page.locator('[data-testid="add-url-button"]').click();
    }
    await page.locator(`[data-testid="batch-url-${i}"]`).fill(urls[i]);
  }
}

export async function verifyErrorState(page: Page, expectedError: string) {
  await expect(page.locator('[data-testid="error-message"]')).toContainText(expectedError);
  await expect(page.locator('[data-testid="download-button"]')).toBeDisabled();
}