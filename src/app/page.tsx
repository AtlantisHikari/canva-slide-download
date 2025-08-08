'use client'

import { useState } from 'react'
import { Download, FileText, Settings } from 'lucide-react'
import UrlInput from '@/components/UrlInput'
import DownloadOptions from '@/components/DownloadOptions'
import ProgressDisplay from '@/components/ProgressDisplay'
import HistoryList from '@/components/HistoryList'
import { useDownloadStore } from '@/lib/store'
import type { DownloadOptions as DownloadOptionsType } from '@/types'

export default function HomePage() {
  const [currentUrl, setCurrentUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'download' | 'history'>('download')
  
  const {
    jobs,
    history,
    preferences,
    addJob,
    updatePreferences
  } = useDownloadStore()

  const [downloadOptions, setDownloadOptions] = useState<DownloadOptionsType>({
    quality: preferences.defaultQuality,
    format: preferences.defaultFormat,
    includeMetadata: true,
    compression: 85
  })

  const handleUrlSubmit = async (url: string) => {
    setCurrentUrl(url)
    setIsProcessing(true)
    
    try {
      const jobId = addJob(url, downloadOptions)
      // 動態獲取basePath以支持前綴路徑
      const basePath = typeof window !== 'undefined' && window.location.pathname.includes('/canva-slide-download') 
        ? '/canva-slide-download' 
        : ''
      
      try {
        const response = await fetch(`${basePath}/api/download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            options: downloadOptions,
            jobId
          }),
        })

        if (response.ok) {
          // Handle the download response
          const blob = await response.blob()
          const downloadUrl = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = `canva-slides-${Date.now()}.${downloadOptions.format === 'pdf' ? 'pdf' : 'zip'}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(downloadUrl)
        } else {
          throw new Error('API not available')
        }
      } catch (apiError) {
        // Fallback for static deployment
        const { downloadCanvaSlides } = await import('@/app/api-fallback')
        const result = await downloadCanvaSlides(url, downloadOptions)
        if (!result.success) {
          throw new Error(result.error || 'Download functionality requires server deployment')
        }
      }
      
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Canva Slide Downloader</h1>
              <p className="text-gray-600">高品質 Canva 簡報下載工具</p>
              <div className="mt-2 text-sm">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  GitHub Pages 展示版本 - 完整功能請部署到 Vercel
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              activeTab === 'download'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Download className="w-4 h-4" />
            下載工具
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            下載記錄
          </button>
        </div>

        {activeTab === 'download' ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step 1: URL Input */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <h2 className="text-xl font-semibold">輸入 Canva 簡報連結</h2>
              </div>
              <UrlInput
                onUrlSubmit={handleUrlSubmit}
                isLoading={isProcessing}
              />
            </div>

            {/* Step 2: Download Options */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <h2 className="text-xl font-semibold">選擇下載設定</h2>
              </div>
              <DownloadOptions
                options={downloadOptions}
                onChange={setDownloadOptions}
                disabled={isProcessing}
              />
            </div>

            {/* Step 3: Progress */}
            {isProcessing && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <h2 className="text-xl font-semibold">下載進度</h2>
                </div>
                <ProgressDisplay
                  progress={{
                    status: 'parsing',
                    currentPage: 0,
                    totalPages: 0,
                    percentage: 0,
                    message: '正在解析 Canva 連結...'
                  }}
                  onCancel={() => setIsProcessing(false)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-6">下載記錄</h2>
              <HistoryList
                history={history}
                onRedownload={(historyItem) => {
                  setActiveTab('download')
                  handleUrlSubmit(historyItem.url)
                }}
                onDelete={(id) => {
                  // Implementation for deleting history item
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}