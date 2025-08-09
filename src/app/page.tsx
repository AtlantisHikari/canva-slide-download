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
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, rgb(248, 250, 252) 0%, rgb(239, 246, 255) 50%, rgb(224, 231, 255) 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.1%22%3E%3Ccircle%20cx=%227%22%20cy=%227%22%20r=%227%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Download className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Canva Slide Downloader
            </h1>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
              將您的 Canva 簡報輕鬆轉換為高品質 PDF 或圖片檔案
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-blue-100">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              🔥 FORCE UPDATE v5.0 - 強制彩色版本 {Date.now()}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-6 relative z-10">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/70 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-white/20">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('download')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'download'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                <Download className="w-4 h-4" />
                下載工具
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                下載記錄
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'download' ? (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Step 1: URL Input */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">輸入 Canva 簡報連結</h2>
                  <p className="text-gray-600">貼上您的 Canva 設計連結，我們將為您分析</p>
                </div>
              </div>
              <UrlInput
                onUrlSubmit={handleUrlSubmit}
                isLoading={isProcessing}
              />
            </div>

            {/* Step 2: Download Options */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">選擇下載設定</h2>
                  <p className="text-gray-600">自訂品質、格式和其他選項</p>
                </div>
              </div>
              <DownloadOptions
                options={downloadOptions}
                onChange={setDownloadOptions}
                disabled={isProcessing}
              />
            </div>

            {/* Step 3: Progress */}
            {isProcessing && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg">
                    3
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">下載進度</h2>
                    <p className="text-gray-600">正在處理您的簡報</p>
                  </div>
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
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">下載記錄</h2>
                  <p className="text-gray-600">查看您的下載歷史和重新下載</p>
                </div>
              </div>
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
      
      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-gray-600">
        <div className="container mx-auto px-4">
          <p className="text-sm">
            Built with ❤️ using Next.js, TypeScript & Tailwind CSS
          </p>
          <p className="text-xs mt-2 opacity-70">
            🤖 Generated with <a href="https://claude.ai/code" className="underline hover:text-blue-600">Claude Code</a>
          </p>
        </div>
      </footer>
    </div>
  )
}