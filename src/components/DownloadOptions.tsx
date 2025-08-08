'use client'

import { useState } from 'react'
import { FileText, Image, Settings } from 'lucide-react'
import type { DownloadOptionsProps } from '@/types'

export default function DownloadOptions({ options, onChange, disabled = false }: DownloadOptionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateOptions = (updates: Partial<typeof options>) => {
    onChange({ ...options, ...updates })
  }

  const qualityOptions = [
    { value: 'medium' as const, label: '標準品質', description: '1920×1080, 適合大多數使用' },
    { value: 'high' as const, label: '高品質', description: '2560×1440, 推薦選擇' },
    { value: 'ultra' as const, label: '超高品質', description: '3840×2160, 最佳列印效果' }
  ]

  const formatOptions = [
    { value: 'pdf' as const, label: 'PDF 檔案', description: '適合分享和列印', icon: FileText },
    { value: 'images' as const, label: '圖片壓縮包', description: '包含所有頁面的PNG圖片', icon: Image }
  ]

  return (
    <div className="space-y-6">
      {/* Quality Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">選擇品質</h3>
        <div className="space-y-2">
          {qualityOptions.map((quality) => (
            <label
              key={quality.value}
              className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                options.quality === quality.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="quality"
                value={quality.value}
                checked={options.quality === quality.value}
                onChange={(e) => updateOptions({ quality: e.target.value as typeof options.quality })}
                disabled={disabled}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{quality.label}</div>
                <div className="text-sm text-gray-600">{quality.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">選擇格式</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formatOptions.map((format) => (
            <label
              key={format.value}
              className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                options.format === format.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="format"
                value={format.value}
                checked={options.format === format.value}
                onChange={(e) => updateOptions({ format: e.target.value as typeof options.format })}
                disabled={disabled}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <format.icon className="w-4 h-4" />
                  {format.label}
                  {format.value === 'pdf' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">推薦</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{format.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          disabled={disabled}
        >
          <Settings className="w-4 h-4" />
          進階設定
          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Include Metadata */}
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => updateOptions({ includeMetadata: e.target.checked })}
                disabled={disabled}
                className="rounded"
              />
              <div>
                <div className="font-medium text-gray-900">包含檔案資訊</div>
                <div className="text-sm text-gray-600">在 PDF 中包含標題、建立時間等資訊</div>
              </div>
            </label>

            {/* Compression */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                壓縮程度: {options.compression}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={options.compression}
                onChange={(e) => updateOptions({ compression: parseInt(e.target.value) })}
                disabled={disabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>小檔案</span>
                <span>高品質</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Time Estimate */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">處理時間預估</h4>
        <p className="text-sm text-blue-800">
          根據選擇的品質，每頁約需 {options.quality === 'ultra' ? '10-15' : options.quality === 'high' ? '5-8' : '3-5'} 秒處理時間
        </p>
      </div>
    </div>
  )
}