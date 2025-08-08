import puppeteer, { Browser, Page } from 'puppeteer'
import type { CanvaDesignInfo } from '@/types'

// Cache for parsed design information
const parseCache = new Map<string, { data: CanvaDesignInfo; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function parseCanvaUrl(url: string): Promise<CanvaDesignInfo> {
  // Check cache first
  const cached = parseCache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  let browser: Browser | null = null
  let page: Page | null = null

  try {
    // Extract design ID from URL
    const designId = extractDesignId(url)
    if (!designId) {
      throw new Error('無法從 URL 中提取設計 ID')
    }

    // Launch browser with optimized settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process'
      ]
    })

    page = await browser.newPage()

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    // Navigate to Canva page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // Wait for page to load and detect if login is required
    await page.waitForTimeout(3000)

    // Check if redirected to login page
    const currentUrl = page.url()
    if (currentUrl.includes('/login') || currentUrl.includes('/signup')) {
      throw new Error('此 Canva 設計需要登入才能訪問，請確保設計為公開狀態')
    }

    // Try to detect design information
    const designInfo = await extractDesignInfo(page, designId, url)

    // Cache the result
    parseCache.set(url, { data: designInfo, timestamp: Date.now() })

    return designInfo

  } catch (error) {
    console.error('Parse Canva URL error:', error)
    throw error
  } finally {
    if (page) await page.close()
    if (browser) await browser.close()
  }
}

function extractDesignId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const designIndex = pathParts.indexOf('design')
    
    if (designIndex !== -1 && pathParts[designIndex + 1]) {
      return pathParts[designIndex + 1]
    }
    
    return null
  } catch {
    return null
  }
}

async function extractDesignInfo(page: Page, designId: string, url: string): Promise<CanvaDesignInfo> {
  try {
    // Wait for main content to load
    await page.waitForTimeout(5000)

    // Try to get page count from pagination or slides
    let pageCount = 1
    let title = 'Canva Design'
    let thumbnailUrl: string | undefined

    // Method 1: Look for pagination indicators
    try {
      const pageCountText = await page.$eval(
        '[data-testid="page-count"], .page-counter, [aria-label*="page"], [aria-label*="slide"]',
        (el) => el.textContent || ''
      )
      
      const match = pageCountText.match(/(\d+)/)
      if (match) {
        pageCount = parseInt(match[1], 10)
      }
    } catch {
      // Method 2: Count slide thumbnails in sidebar
      try {
        const thumbnails = await page.$$('[data-testid="slide-thumbnail"], .slide-thumbnail, .page-thumbnail')
        if (thumbnails.length > 0) {
          pageCount = thumbnails.length
        }
      } catch {
        console.log('Could not detect page count from thumbnails')
      }
    }

    // Try to get design title
    try {
      const titleElement = await page.$('h1, [data-testid="design-title"], .design-title, title')
      if (titleElement) {
        title = await titleElement.evaluate(el => el.textContent || 'Canva Design')
      }
    } catch {
      console.log('Could not extract design title')
    }

    // Try to get thumbnail URL
    try {
      const thumbnailElement = await page.$('meta[property="og:image"]')
      if (thumbnailElement) {
        thumbnailUrl = await thumbnailElement.evaluate(el => el.getAttribute('content') || undefined)
      }
    } catch {
      console.log('Could not extract thumbnail URL')
    }

    // Determine design type based on URL structure and content
    let designType: 'presentation' | 'document' | 'design' = 'design'
    if (url.includes('presentation') || pageCount > 1) {
      designType = 'presentation'
    } else if (url.includes('document')) {
      designType = 'document'
    }

    // Check if design is public (if we can access it without login, it's likely public or shared)
    const isPublic = !page.url().includes('/login')

    // Check edit access (simplified - assume no edit access for public designs)
    const hasEditAccess = false

    return {
      designId,
      designType,
      title: title.trim(),
      pageCount,
      isPublic,
      hasEditAccess,
      thumbnailUrl
    }

  } catch (error) {
    console.error('Error extracting design info:', error)
    
    // Return minimal design info if extraction fails
    return {
      designId,
      designType: 'design',
      title: 'Canva Design',
      pageCount: 1,
      isPublic: true,
      hasEditAccess: false
    }
  }
}

// Utility function to validate and normalize Canva URLs
export function normalizeCanvaUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Ensure HTTPS
    urlObj.protocol = 'https:'
    
    // Normalize hostname
    if (urlObj.hostname === 'canva.com') {
      urlObj.hostname = 'www.canva.com'
    }
    
    // Add /view if no action specified
    if (!urlObj.pathname.includes('/view') && !urlObj.pathname.includes('/edit')) {
      urlObj.pathname += '/view'
    }
    
    return urlObj.toString()
  } catch {
    throw new Error('無效的 URL 格式')
  }
}

// Clear cache periodically
setInterval(() => {
  const now = Date.now()
  for (const [url, { timestamp }] of parseCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      parseCache.delete(url)
    }
  }
}, CACHE_DURATION)