/**
 * 健康檢查 API 端點
 * 提供服務狀態、版本資訊和系統健康狀況
 */
export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'canva-slide-download',
      version: process.env.npm_package_version || '0.1.0',
      basePath: '/canva-slide-download',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        limit: process.env.PUPPETEER_MEMORY_LIMIT || 512
      },
      features: {
        batchDownload: process.env.ENABLE_BATCH_DOWNLOAD === 'true',
        qualityPresets: process.env.ENABLE_QUALITY_PRESETS === 'true',
        progressTracking: process.env.ENABLE_PROGRESS_TRACKING === 'true',
        downloadHistory: process.env.ENABLE_DOWNLOAD_HISTORY === 'true'
      }
    };

    return Response.json(healthData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('健康檢查失敗:', error);
    
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'canva-slide-download',
      error: '服務暫時不可用'
    }, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

/**
 * 支援 HEAD 請求進行快速健康檢查
 */
export async function HEAD() {
  return new Response(null, { status: 200 });
}