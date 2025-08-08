import { NextRequest, NextResponse } from 'next/server'
import { getJobProgress } from '@/lib/progress-tracker'
import type { ProgressResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json<ProgressResponse>({
        success: false,
        error: {
          code: 'MISSING_JOB_ID',
          message: '缺少 Job ID',
          timestamp: new Date(),
          recoverable: true
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const progress = await getJobProgress(jobId)

    if (!progress) {
      return NextResponse.json<ProgressResponse>({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: '找不到指定的下載任務',
          timestamp: new Date(),
          recoverable: false
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    return NextResponse.json<ProgressResponse>({
      success: true,
      data: progress,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Progress tracking error:', error)
    
    return NextResponse.json<ProgressResponse>({
      success: false,
      error: {
        code: 'PROGRESS_ERROR',
        message: error instanceof Error ? error.message : '獲取進度時發生錯誤',
        timestamp: new Date(),
        recoverable: true
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Server-Sent Events for real-time progress updates
export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({
        error: 'Missing job ID'
      }, { status: 400 })
    }

    // Set up SSE headers
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected', jobId })}\n\n`)
        )

        // Set up progress monitoring
        const interval = setInterval(async () => {
          try {
            const progress = await getJobProgress(jobId)
            
            if (progress) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'progress', data: progress })}\n\n`)
              )

              // Close connection when job is complete or failed
              if (progress.status === 'complete' || progress.status === 'error') {
                clearInterval(interval)
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'close' })}\n\n`)
                )
                controller.close()
              }
            }
          } catch (error) {
            console.error('SSE progress error:', error)
            clearInterval(interval)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Progress tracking failed' })}\n\n`)
            )
            controller.close()
          }
        }, 1000) // Update every second

        // Clean up on client disconnect
        return () => {
          clearInterval(interval)
        }
      }
    })

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('SSE setup error:', error)
    return NextResponse.json({
      error: 'Failed to set up progress tracking'
    }, { status: 500 })
  }
}