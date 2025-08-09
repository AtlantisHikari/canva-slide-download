'use client'

import { useState, useEffect } from 'react'
import { Link, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import type { UrlInputProps } from '@/types'

export default function UrlInput({ onUrlSubmit, isLoading = false, error }: UrlInputProps) {
  const [url, setUrl] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    designInfo?: any
  } | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const validateUrl = async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setValidationResult(null)
      return
    }

    setIsValidating(true)
    
    try {
      // Basic URL format validation
      if (!isCanvaUrl(inputUrl)) {
        setValidationResult({
          isValid: false,
          message: '請輸入有效的 Canva 設計連結'
        })
        return
      }

      // Try API first, fallback to client-side validation for static deployment
      const basePath = typeof window !== 'undefined' && window.location.pathname.includes('/canva-slide-download') 
        ? '/canva-slide-download' 
        : ''
      
      let result;
      try {
        const response = await fetch(`${basePath}/api/parse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: inputUrl }),
        })

        if (response.ok) {
          result = await response.json()
        } else {
          throw new Error('API not available')
        }
      } catch (apiError) {
        // Fallback to client-side validation for static deployment
        const { parseCanvaUrl } = await import('@/app/api-fallback')
        result = await parseCanvaUrl(inputUrl)
      }

      if (result.valid) {
        setValidationResult({
          isValid: true,
          message: `找到 ${result.slideCount} 頁簡報: ${result.title}`,
          designInfo: result
        })
      } else {
        setValidationResult({
          isValid: false,
          message: result.error || '無法訪問此 Canva 設計'
        })
      }

    } catch (err) {
      setValidationResult({
        isValid: false,
        message: '網路錯誤，請檢查連接後重試'
      })
    } finally {
      setIsValidating(false)
    }
  }

  let validateTimeout: NodeJS.Timeout

  const handleUrlChange = (value: string) => {
    setUrl(value)
    
    // Debounced validation
    if (validateTimeout) {
      clearTimeout(validateTimeout)
    }
    
    validateTimeout = setTimeout(() => {
      validateUrl(value)
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      return
    }

    // For demo purposes, always allow submission if URL looks like Canva
    if (isCanvaUrl(url.trim())) {
      onUrlSubmit(url.trim())
    } else {
      setValidationResult({
        isValid: false,
        message: '請輸入有效的 Canva 設計連結（例：https://www.canva.com/design/xxxxx/view）'
      })
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && isCanvaUrl(text)) {
        setUrl(text)
        handleUrlChange(text)
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Link className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="貼上您的 Canva 簡報連結 (例：https://www.canva.com/design/xxxxx/view)"
            className="w-full pl-14 pr-24 py-4 text-lg border-2 border-gray-200 rounded-2xl bg-white/70 backdrop-blur-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all duration-300 placeholder-gray-400"
            disabled={isLoading}
          />
          
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
            {isClient && navigator.clipboard && (
              <button
                type="button"
                onClick={pasteFromClipboard}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                disabled={isLoading}
              >
                📋 貼上
              </button>
            )}
          </div>
        </div>

        {/* Validation Status */}
        {(isValidating || validationResult) && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
            isValidating 
              ? 'bg-blue-50 border-blue-200'
              : validationResult?.isValid 
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
          }`}>
            {isValidating ? (
              <>
                <div className="relative">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <div className="absolute inset-0 w-5 h-5 border-2 border-blue-200 rounded-full animate-pulse"></div>
                </div>
                <span className="text-blue-700 font-medium">🔍 正在分析您的 Canva 設計...</span>
              </>
            ) : validationResult?.isValid ? (
              <>
                <div className="relative">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="absolute -inset-1 bg-green-200 rounded-full animate-ping opacity-20"></div>
                </div>
                <span className="text-green-700 font-medium">✅ {validationResult.message}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">❌ {validationResult?.message}</span>
              </>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform ${
            isLoading || !url.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>🚀 處理中...</span>
            </>
          ) : (
            <>
              <Download className="w-6 h-6" />
              <span>✨ 開始神奇下載</span>
            </>
          )}
        </button>
      </form>

      {/* Usage Instructions */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-6 shadow-inner">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">💡</span>
          </div>
          <h4 className="text-lg font-bold text-gray-800">使用指南</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">支援格式</p>
              <p className="text-sm text-gray-600">canva.com/design/xxxxx</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">公開分享</p>
              <p className="text-sm text-gray-600">確保設計可公開訪問</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">多頁支援</p>
              <p className="text-sm text-gray-600">自動整合為單一檔案</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function isCanvaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      (urlObj.hostname === 'www.canva.com' || urlObj.hostname === 'canva.com') &&
      urlObj.pathname.includes('/design/')
    )
  } catch {
    return false
  }
}