// src/lib/data/3d-client-polling.ts
"use client"

import { getThreeDJobStatus } from "./3d-poll-model"

// Polling configuration for client-side polling
const THREED_POLLING_INTERVAL = 5000 // 5 seconds
const THREED_MAX_POLLING_ATTEMPTS = 60 // 5 minutes max (60 attempts * 5 seconds)

// Types for client polling
interface ThreeDJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  prediction_id?: string
  model_url?: string
  original_model_url?: string
  uploaded_images?: UploadedImage[]
  compression_stats?: CompressionStat[]
  processing_time?: number
  error_message?: string
  created_at: string
  updated_at?: string
  metadata?: Record<string, any>
}

interface UploadedImage {
  url: string
  filename: string
  base64?: string
  size_mb: string
}

interface CompressionStat {
  filename: string
  original_size_mb: string
  compressed_size_mb: string
  compression_ratio: string
}

interface ClientPollingOptions {
  onProgress?: (progress: number, status: string, job: ThreeDJob) => void
  signal?: AbortSignal
  maxAttempts?: number
  interval?: number
}

/**
 * Client-side polling function for ThreeD jobs
 * This runs entirely on the client and calls server actions for status checks
 */
export async function clientPollThreeDJob(
  jobId: string, 
  options: ClientPollingOptions = {}
): Promise<ThreeDJob> {
  const {
    onProgress,
    signal,
    maxAttempts = THREED_MAX_POLLING_ATTEMPTS,
    interval = THREED_POLLING_INTERVAL
  } = options

  let attempts = 0
  
  console.log(`🔄 Starting client-side polling for ThreeD job: ${jobId}`)
  
  const poll = async (): Promise<ThreeDJob> => {
    // Check if polling was cancelled
    if (signal?.aborted) {
      throw new Error('Polling was cancelled')
    }
    
    if (attempts >= maxAttempts) {
      throw new Error(`ThreeD job polling timed out after ${maxAttempts} attempts (${(maxAttempts * interval) / 1000} seconds)`)
    }
    
    attempts++
    console.log(`📊 Client polling attempt ${attempts}/${maxAttempts} for job ${jobId}`)
    
    try {
      // Call server action for status check
      const result = await getThreeDJobStatus(jobId)
      const job = result.job
      
      // Calculate progress based on status and time
      let progress = 0
      switch (job.status) {
        case 'pending':
          progress = 5 + (attempts * 2) // Start at 5%, slowly increase
          break
        case 'processing':
          progress = 20 + (attempts * 3) // Processing stage, increase more rapidly
          break
        case 'completed':
          progress = 100
          break
        case 'failed':
          progress = 0
          break
      }
      
      // Cap progress at 95% until actually completed
      if (job.status !== 'completed') {
        progress = Math.min(progress, 95)
      }
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress(progress, job.status, job)
      }
      
      console.log(`📈 Job ${jobId} status: ${job.status} (${progress}%)`)
      
      // Check if job is finished
      if (job.status === 'completed') {
        console.log(`✅ Job ${jobId} completed successfully`)
        return job
      }
      
      if (job.status === 'failed') {
        const errorMsg = job.error_message || 'Job failed with unknown error'
        console.error(`❌ Job ${jobId} failed: ${errorMsg}`)
        throw new Error(`3D model generation failed: ${errorMsg}`)
      }
      
      // Wait before next poll (but check for cancellation)
      console.log(`⏳ Waiting ${interval}ms before next poll...`)
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, interval)
        
        // Handle cancellation during wait
        if (signal) {
          const abortHandler = () => {
            clearTimeout(timeoutId)
            reject(new Error('Polling was cancelled'))
          }
          
          if (signal.aborted) {
            clearTimeout(timeoutId)
            reject(new Error('Polling was cancelled'))
            return
          }
          
          signal.addEventListener('abort', abortHandler, { once: true })
          
          // Cleanup listener when timeout completes
          setTimeout(() => {
            signal.removeEventListener('abort', abortHandler)
          }, interval)
        }
      })
      
      // Continue polling
      return poll()
      
    } catch (error: any) {
      // If it's a cancellation, re-throw
      if (error.message === 'Polling was cancelled' || signal?.aborted) {
        throw error
      }
      
      // For other errors, log and continue polling (with backoff)
      console.warn(`⚠️ Polling attempt ${attempts} failed, will retry:`, error.message)
      
      // If we've tried too many times, give up
      if (attempts >= maxAttempts) {
        throw new Error(`Failed to poll job after ${maxAttempts} attempts. Last error: ${error.message}`)
      }
      
      // Wait a bit longer on errors (exponential backoff)
      const backoffDelay = Math.min(interval * Math.pow(1.5, attempts - 1), 30000) // Max 30 seconds
      console.log(`⏳ Waiting ${backoffDelay}ms after error before retry...`)
      
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, backoffDelay)
        
        if (signal) {
          const abortHandler = () => {
            clearTimeout(timeoutId)
            reject(new Error('Polling was cancelled'))
          }
          
          if (signal.aborted) {
            clearTimeout(timeoutId)
            reject(new Error('Polling was cancelled'))
            return
          }
          
          signal.addEventListener('abort', abortHandler, { once: true })
          
          setTimeout(() => {
            signal.removeEventListener('abort', abortHandler)
          }, backoffDelay)
        }
      })
      
      // Continue polling
      return poll()
    }
  }
  
  return poll()
}

/**
 * Convenience function to start polling with default options
 */
export async function startThreeDJobPolling(
  jobId: string,
  onProgress?: (progress: number, status: string, job: ThreeDJob) => void
): Promise<ThreeDJob> {
  return clientPollThreeDJob(jobId, { onProgress })
}

/**
 * Create an AbortController for cancelling polling
 */
export function createPollingController(): AbortController {
  return new AbortController()
}

/**
 * Utility to check if a job is in a final state
 */
export function isJobFinal(status: string): boolean {
  return status === 'completed' || status === 'failed'
}

/**
 * Utility to get a human-readable status message
 */
export function getStatusMessage(status: string, progress?: number): string {
  switch (status) {
    case 'pending':
      return 'Queued for processing...'
    case 'processing':
      return progress ? `Processing (${progress}% complete)` : 'Processing...'
    case 'completed':
      return '3D model generation complete!'
    case 'failed':
      return 'Generation failed'
    default:
      return 'Unknown status'
  }
}

/*
 * USAGE EXAMPLE:
 * 
 * ```typescript
 * // In your React component
 * const [job, setJob] = useState<ThreeDJob | null>(null)
 * const [progress, setProgress] = useState(0)
 * const pollingController = useRef<AbortController | null>(null)
 * 
 * const startPolling = async (jobId: string) => {
 *   // Create abort controller for cancellation
 *   pollingController.current = new AbortController()
 *   
 *   try {
 *     const result = await clientPollThreeDJob(jobId, {
 *       onProgress: (progress, status, job) => {
 *         setProgress(progress)
 *         console.log(`${status}: ${progress}%`)
 *       },
 *       signal: pollingController.current.signal
 *     })
 *     
 *     setJob(result)
 *     console.log('Job completed!', result)
 *   } catch (error) {
 *     if (error.message !== 'Polling was cancelled') {
 *       console.error('Polling failed:', error)
 *     }
 *   }
 * }
 * 
 * const cancelPolling = () => {
 *   if (pollingController.current) {
 *     pollingController.current.abort()
 *   }
 * }
 * 
 * // Cleanup on unmount
 * useEffect(() => {
 *   return () => {
 *     if (pollingController.current) {
 *       pollingController.current.abort()
 *     }
 *   }
 * }, [])
 * ```
 * 
 * KEY BENEFITS:
 * 
 * 1. **Pure Client-Side**: No server-side polling, avoiding the "Client Reference" error
 * 2. **Cancellable**: Uses AbortController for clean cancellation
 * 3. **Progress Tracking**: Real-time progress updates via callbacks
 * 4. **Error Handling**: Robust error handling with exponential backoff
 * 5. **Type Safe**: Full TypeScript support with proper types
 * 6. **Configurable**: Customizable polling intervals and max attempts
 * 7. **Memory Efficient**: Proper cleanup and abort handling
 */