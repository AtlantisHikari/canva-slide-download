import puppeteer, { Browser, Page } from 'puppeteer'
import type { CaptureOptions, DownloadOptions, QUALITY_PRESETS } from '@/types'

export class ScreenshotEngine {
  private browser: Browser | null = null
  private page: Page | null = null

  async initialize(): Promise<void> {
    if (this.browser) return

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    })

    this.page = await this.browser.newPage()
    
    // Set user agent to avoid detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    // Block unnecessary resources to speed up loading
    await this.page.setRequestInterception(true)
    this.page.on('request', (req) => {
      const resourceType = req.resourceType()
      if (['font', 'image', 'media'].includes(resourceType)) {
        // Allow images for the actual design, block others
        if (req.url().includes('canva.com') && resourceType === 'image') {
          req.continue()
        } else if (resourceType !== 'image') {
          req.continue()
        } else {
          req.abort()
        }
      } else {
        req.continue()
      }
    })
  }

  async captureSlides(
    url: string, 
    pageCount: number,
    options: DownloadOptions,
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<Buffer[]> {
    if (!this.page) {
      throw new Error('Screenshot engine not initialized')
    }

    const captureOptions = QUALITY_PRESETS[options.quality]
    const screenshots: Buffer[] = []

    try {
      // Set viewport based on quality settings
      await this.page.setViewport({
        width: captureOptions.width,
        height: captureOptions.height,
        deviceScaleFactor: captureOptions.deviceScaleFactor || 2
      })

      // Navigate to the first page
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      onProgress?.(0, pageCount, '正在載入簡報...')

      // Wait for initial load
      await this.page.waitForTimeout(captureOptions.waitForLoad)

      // Wait for Canva editor to fully load
      await this.waitForCanvaLoad()

      for (let i = 0; i < pageCount; i++) {
        onProgress?.(i + 1, pageCount, `正在截圖第 ${i + 1} 頁...`)

        // Navigate to specific page if needed
        if (i > 0) {
          await this.navigateToPage(i + 1)
          await this.page.waitForTimeout(2000) // Wait for page transition
        }

        // Take screenshot of the main canvas/design area
        const screenshot = await this.captureDesignArea(captureOptions)
        screenshots.push(screenshot)

        // Brief pause between screenshots
        await this.page.waitForTimeout(500)
      }

      onProgress?.(pageCount, pageCount, '截圖完成！')
      return screenshots

    } catch (error) {
      console.error('Screenshot capture error:', error)
      throw new Error(`截圖失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  private async waitForCanvaLoad(): Promise<void> {
    try {
      // Wait for common Canva elements to appear
      await this.page?.waitForSelector(
        '[data-testid="design-canvas"], .canvas-container, .design-surface',
        { timeout: 15000 }
      )

      // Additional wait for content to render
      await this.page?.waitForTimeout(3000)

      // Wait for any loading indicators to disappear
      await this.page?.waitForFunction(
        () => {
          const loadingElements = document.querySelectorAll('[data-testid="loading"], .loading, .spinner')
          return loadingElements.length === 0
        },
        { timeout: 10000 }
      ).catch(() => {
        // Ignore timeout - continue anyway
      })

    } catch (error) {
      console.log('Canva load detection failed, continuing anyway:', error)
    }
  }

  private async navigateToPage(pageNumber: number): Promise<void> {
    if (!this.page) return

    try {
      // Method 1: Try clicking page thumbnail
      const thumbnailSelector = `[data-testid="slide-thumbnail"]:nth-child(${pageNumber}), .slide-thumbnail:nth-child(${pageNumber})`
      const thumbnail = await this.page.$(thumbnailSelector)
      
      if (thumbnail) {
        await thumbnail.click()
        return
      }

      // Method 2: Try pagination controls
      const nextButton = await this.page.$('[aria-label="Next page"], .page-next, [data-testid="next-page"]')
      if (nextButton) {
        for (let i = 1; i < pageNumber; i++) {
          await nextButton.click()
          await this.page.waitForTimeout(1000)
        }
        return
      }

      // Method 3: Try keyboard navigation
      await this.page.keyboard.press('ArrowRight')
      await this.page.waitForTimeout(500)

    } catch (error) {
      console.log(`Failed to navigate to page ${pageNumber}:`, error)
    }
  }

  private async captureDesignArea(options: CaptureOptions): Promise<Buffer> {
    if (!this.page) {
      throw new Error('Page not available')
    }

    try {
      // Try to find the main design canvas
      const canvasSelector = '[data-testid="design-canvas"], .canvas-container, .design-surface, canvas'
      const canvas = await this.page.$(canvasSelector)

      if (canvas) {
        // Screenshot just the canvas area
        return await canvas.screenshot({
          type: options.format,
          quality: options.format === 'jpeg' ? options.quality : undefined,
          omitBackground: false
        }) as Buffer
      } else {
        // Fallback: screenshot the entire viewport
        return await this.page.screenshot({
          type: options.format,
          quality: options.format === 'jpeg' ? options.quality : undefined,
          fullPage: false,
          omitBackground: false
        }) as Buffer
      }

    } catch (error) {
      console.error('Canvas screenshot failed, trying fullpage:', error)
      
      // Final fallback: full page screenshot
      return await this.page.screenshot({
        type: options.format,
        quality: options.format === 'jpeg' ? options.quality : undefined,
        fullPage: true,
        omitBackground: false
      }) as Buffer
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close()
        this.page = null
      }
      
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
    } catch (error) {
      console.error('Screenshot engine cleanup error:', error)
    }
  }
}

// Singleton instance for reuse
let screenshotEngineInstance: ScreenshotEngine | null = null

export async function getScreenshotEngine(): Promise<ScreenshotEngine> {
  if (!screenshotEngineInstance) {
    screenshotEngineInstance = new ScreenshotEngine()
    await screenshotEngineInstance.initialize()
  }
  return screenshotEngineInstance
}

export async function cleanupScreenshotEngine(): Promise<void> {
  if (screenshotEngineInstance) {
    await screenshotEngineInstance.cleanup()
    screenshotEngineInstance = null
  }
}