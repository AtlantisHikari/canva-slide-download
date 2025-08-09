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
    <div className="space-y-8">
      {/* Quality Selection */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">選擇品質</h3>
        </div>
        <div className="grid gap-4">
          {qualityOptions.map((quality) => (
            <label
              key={quality.value}
              className={`group relative flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                options.quality === quality.value
                  ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg ring-4 ring-purple-100'
                  : 'border-gray-200 bg-white/70 backdrop-blur-sm hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mr-4 mt-1 flex items-center justify-center transition-all duration-300 ${
                options.quality === quality.value
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300 group-hover:border-purple-400'
              }`}>
                {options.quality === quality.value && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
              <input
                type="radio"
                name="quality"
                value={quality.value}
                checked={options.quality === quality.value}
                onChange={(e) => updateOptions({ quality: e.target.value as typeof options.quality })}
                disabled={disabled}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-800 mb-1">{quality.label}</div>
                <div className="text-gray-600">{quality.description}</div>
              </div>
              {options.quality === quality.value && (
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✨</span>
                  </div>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">📁</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">選擇格式</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formatOptions.map((format) => (
            <label
              key={format.value}
              className={`group relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl ${
                options.format === format.value
                  ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl ring-4 ring-blue-100 transform scale-105'
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-cyan-50/50 hover:transform hover:scale-102'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mb-4 self-end transition-all duration-300 ${
                options.format === format.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 group-hover:border-blue-400'
              }`}>
                {options.format === format.value && (
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <input
                type="radio"
                name="format"
                value={format.value}
                checked={options.format === format.value}
                onChange={(e) => updateOptions({ format: e.target.value as typeof options.format })}
                disabled={disabled}
                className="sr-only"
              />
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  options.format === format.value
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-cyan-500'
                }`}>
                  <format.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center justify-center gap-2 font-bold text-lg text-gray-800 mb-2">
                  {format.label}
                  {format.value === 'pdf' && (
                    <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full font-bold shadow-sm">推薦</span>
                  )}
                </div>
                <div className="text-gray-600 text-sm">{format.description}</div>
              </div>
              {options.format === format.value && (
                <div className="absolute -top-3 -right-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">✨</span>
                  </div>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="group flex items-center gap-3 text-lg font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-300"
          disabled={disabled}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 group-hover:from-purple-500 group-hover:to-pink-600 rounded-xl flex items-center justify-center transition-all duration-300">
            <Settings className="w-4 h-4 text-white" />
          </div>
          進階設定
          <span className={`transform transition-all duration-300 ${showAdvanced ? 'rotate-180 text-purple-600' : ''}`}>
            ⬇️
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-6 space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl shadow-inner">
            {/* Include Metadata */}
            <label className="group flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-300">
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                options.includeMetadata
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300 group-hover:border-purple-400'
              }`}>
                {options.includeMetadata && (
                  <span className="text-white text-sm">✓</span>
                )}
              </div>
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => updateOptions({ includeMetadata: e.target.checked })}
                disabled={disabled}
                className="sr-only"
              />
              <div>
                <div className="font-bold text-gray-800 mb-1">包含檔案資訊</div>
                <div className="text-sm text-gray-600">在 PDF 中包含標題、建立時間等資訊</div>
              </div>
            </label>

            {/* Compression */}
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <label className="block text-lg font-bold text-gray-800 mb-4">
                壓縮程度: <span className="text-purple-600">{options.compression}%</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={options.compression}
                  onChange={(e) => updateOptions({ compression: parseInt(e.target.value) })}
                  disabled={disabled}
                  className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #fecaca 0%, #fde047 50%, #bbf7d0 100%)`
                  }}
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #8b5cf6, #a855f7);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
                    border: 2px solid white;
                  }
                  .slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #8b5cf6, #a855f7);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
                    border: 2px solid white;
                  }
                `}</style>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-600 mt-3">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                  小檔案
                </span>
                <span className="flex items-center gap-1">
                  高品質
                  <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Time Estimate */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm">⏱️</span>
          </div>
          <h4 className="text-lg font-bold text-gray-800">處理時間預估</h4>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100">
          <div className="flex-1">
            <p className="text-gray-700 font-medium">
              根據選擇的品質，每頁約需 <span className="text-blue-600 font-bold">{options.quality === 'ultra' ? '10-15' : options.quality === 'high' ? '5-8' : '3-5'}</span> 秒處理時間
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${
                    i < (options.quality === 'ultra' ? 3 : options.quality === 'high' ? 2 : 1)
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  } animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
              </div>
              <span className="text-xs text-gray-600 font-medium">
                {options.quality === 'ultra' ? '最高品質' : options.quality === 'high' ? '高品質' : '標準品質'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}