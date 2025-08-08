import { parseCanvaUrl, normalizeCanvaUrl } from './canva-parser'
import { getScreenshotEngine, cleanupScreenshotEngine } from './screenshot-engine'
import { generatePdfFromImages } from './pdf-generator'
import { useDownloadStore } from './store'
import type { DownloadOptions, DownloadResult, DownloadProgress, PdfMetadata } from '@/types'

export async function downloadCanvaSlides(
  url: string,
  options: DownloadOptions,
  jobId?: string
): Promise<DownloadResult> {
  const startTime = Date.now()
  let screenshotEngine: any = null

  // Progress update helper
  const updateProgress = (progress: DownloadProgress) => {
    if (jobId) {
      useDownloadStore.getState().updateJobProgress(jobId, progress)
    }
  }

  try {
    // Step 1: Normalize and parse URL
    updateProgress({
      status: 'parsing',
      currentPage: 0,
      totalPages: 0,
      percentage: 5,
      message: '正在解析 Canva 連結...'
    })

    const normalizedUrl = normalizeCanvaUrl(url)
    const designInfo = await parseCanvaUrl(normalizedUrl)

    if (!designInfo.isPublic) {
      throw new Error('此 Canva 設計為私人設計，無法下載')
    }

    updateProgress({
      status: 'parsing',
      currentPage: 0,
      totalPages: designInfo.pageCount || 1,
      percentage: 15,
      message: `發現 ${designInfo.pageCount || 1} 頁簡報`
    })

    // Step 2: Initialize screenshot engine
    updateProgress({
      status: 'capturing',
      currentPage: 0,
      totalPages: designInfo.pageCount || 1,
      percentage: 20,
      message: '正在初始化截圖引擎...'
    })

    screenshotEngine = await getScreenshotEngine()

    // Step 3: Capture screenshots
    const screenshots: Buffer[] = []
    const totalPages = designInfo.pageCount || 1

    for (let i = 0; i < totalPages; i++) {
      const pageProgress = 20 + (50 * i / totalPages)
      
      updateProgress({
        status: 'capturing',
        currentPage: i + 1,
        totalPages,
        percentage: pageProgress,
        message: `正在截圖第 ${i + 1} 頁，共 ${totalPages} 頁`
      })

      try {
        const pageScreenshots = await screenshotEngine.captureSlides(
          normalizedUrl,
          1, // Capture one page at a time for better progress tracking
          options,
          (current, total, message) => {
            updateProgress({
              status: 'capturing',
              currentPage: i + 1,
              totalPages,
              percentage: pageProgress + (5 * current / total),
              message
            })
          }
        )

        screenshots.push(...pageScreenshots)

      } catch (error) {
        console.error(`Error capturing page ${i + 1}:`, error)
        // Continue with other pages, but log the error
      }
    }

    if (screenshots.length === 0) {
      throw new Error('無法截取任何簡報頁面')
    }

    updateProgress({
      status: 'capturing',
      currentPage: totalPages,
      totalPages,
      percentage: 70,
      message: `成功截圖 ${screenshots.length} 頁`
    })

    // Step 4: Generate output file
    if (options.format === 'pdf') {
      updateProgress({
        status: 'generating',
        currentPage: 0,
        totalPages: screenshots.length,
        percentage: 75,
        message: '正在生成 PDF 文件...'
      })

      const metadata: PdfMetadata = {
        title: designInfo.title || 'Canva Slides',
        author: 'Canva Slide Downloader',
        creator: 'Canva Slide Downloader',
        creationDate: new Date(),
        pageCount: screenshots.length
      }

      const pdfBuffer = await generatePdfFromImages(
        screenshots,
        options,
        metadata,
        (current, total, message) => {
          updateProgress({
            status: 'generating',
            currentPage: current,
            totalPages: total,
            percentage: 75 + (20 * current / total),
            message
          })
        }
      )

      const processingTime = Date.now() - startTime
      const filename = `${designInfo.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'canva_slides'}_${Date.now()}.pdf`

      updateProgress({
        status: 'complete',
        currentPage: screenshots.length,
        totalPages: screenshots.length,
        percentage: 100,
        message: '下載完成！'
      })

      return {
        success: true,
        data: pdfBuffer,
        filename,
        fileSize: pdfBuffer.length,
        pageCount: screenshots.length,
        processingTime
      }

    } else {
      // Return images as ZIP file
      updateProgress({
        status: 'generating',
        currentPage: 0,
        totalPages: screenshots.length,
        percentage: 75,
        message: '正在打包圖片文件...'
      })

      const zipBuffer = await createImageZip(screenshots, designInfo.title)
      const processingTime = Date.now() - startTime
      const filename = `${designInfo.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'canva_slides'}_${Date.now()}.zip`

      updateProgress({
        status: 'complete',
        currentPage: screenshots.length,
        totalPages: screenshots.length,
        percentage: 100,
        message: '下載完成！'
      })

      return {
        success: true,
        data: zipBuffer,
        filename,
        fileSize: zipBuffer.length,
        pageCount: screenshots.length,
        processingTime
      }
    }

  } catch (error) {
    console.error('Download error:', error)
    
    const errorMessage = error instanceof Error ? error.message : '下載過程中發生未知錯誤'
    
    updateProgress({
      status: 'error',
      currentPage: 0,
      totalPages: 0,
      percentage: 0,
      message: errorMessage
    })

    return {
      success: false,
      error: errorMessage,
      processingTime: Date.now() - startTime
    }

  } finally {
    // Cleanup resources
    try {
      if (screenshotEngine) {
        await cleanupScreenshotEngine()
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError)
    }
  }
}

async function createImageZip(images: Buffer[], title?: string): Promise<Buffer> {
  // For now, return a simple concatenated buffer
  // In production, you'd want to use a proper ZIP library like JSZip
  const JSZip = await import('jszip')
  const zip = new JSZip.default()

  images.forEach((imageBuffer, index) => {
    const filename = `slide_${(index + 1).toString().padStart(3, '0')}.png`
    zip.file(filename, imageBuffer)
  })

  // Add metadata file
  const metadata = {
    title: title || 'Canva Slides',
    pageCount: images.length,
    createdAt: new Date().toISOString(),
    generator: 'Canva Slide Downloader'
  }
  
  zip.file('metadata.json', JSON.stringify(metadata, null, 2))

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
  return zipBuffer
}

// Utility function for batch downloads
export async function downloadMultipleSlides(
  urls: string[],
  options: DownloadOptions,
  onProgress?: (completed: number, total: number, currentUrl: string) => void
): Promise<DownloadResult[]> {
  const results: DownloadResult[] = []
  const maxConcurrent = 2 // Limit concurrent downloads to avoid overwhelming

  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent)
    
    const batchPromises = batch.map(async (url) => {
      onProgress?.(i, urls.length, url)
      
      try {
        return await downloadCanvaSlides(url, options)
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '下載失敗'
        }
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }

  onProgress?.(urls.length, urls.length, '批次下載完成')
  return results
}

// Progress tracking for external use
export async function getJobProgress(jobId: string): Promise<DownloadProgress | null> {
  const store = useDownloadStore.getState()
  const job = store.jobs.get(jobId)
  return job?.progress || null
}