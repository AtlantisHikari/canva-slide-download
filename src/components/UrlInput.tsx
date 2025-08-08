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

    if (validationResult?.isValid) {
      onUrlSubmit(url.trim())
    } else {
      // Force validation
      validateUrl(url.trim())
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
    <div className="space-y-4">
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="貼上 Canva 簡報連結..."
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
            {isClient && navigator.clipboard && (
              <button
                type="button"
                onClick={pasteFromClipboard}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={isLoading}
              >
                貼上
              </button>
            )}
          </div>
        </div>

        {/* Validation Status */}
        {(isValidating || validationResult) && (
          <div className="flex items-center gap-2 text-sm">
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-gray-600">正在驗證連結...</span>
              </>
            ) : validationResult?.isValid ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700">{validationResult.message}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700">{validationResult?.message}</span>
              </>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !url.trim() || !validationResult?.isValid}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
            isLoading || !url.trim() || !validationResult?.isValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>下載中...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>開始下載</span>
            </>
          )}
        </button>
      </form>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">使用說明：</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 支援格式：https://www.canva.com/design/xxxxx/view</li>
          <li>• 確保簡報為公開狀態或已分享</li>
          <li>• 支援多頁簡報自動整合為 PDF</li>
        </ul>
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