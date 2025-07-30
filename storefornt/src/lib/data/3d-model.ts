"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
} from "./cookies"

// Polling configuration
const POLLING_INTERVAL = 3000 // 3 seconds
const MAX_POLLING_ATTEMPTS = 100 // ~5 minutes max

interface ModelGenerationData {
  model_url: string
  prediction_id: string
  uploaded_images: string[]
  compression_stats: any[]
  processing_time?: number
  created_at: string
  completed_at: string
}

interface JobStatusResponse {
  success: boolean
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  model_url?: string
  error?: string
  message?: string
  progress?: number
  created_at?: string
  updated_at?: string
}

interface ModelGenerationResponse {
  success: boolean
  message?: string
  data?: ModelGenerationData | { job_id: string }
  error?: string
  job_id?: string
}

export async function generate3DModel(formData: FormData): Promise<ModelGenerationResponse> {
  const authHeaders = await getAuthHeaders()
  
  // Get publishable key from environment
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  
  console.log("📤 FormData being sent:", {
    files: formData.getAll('files').length,
    keys: Array.from(formData.keys()),
    authHeaders: authHeaders,
    hasPublishableKey: !!publishableKey
  })
  
  // Use direct fetch instead of SDK to properly handle FormData
  const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/3d-model`, {
    method: "POST",
    body: formData,
    headers: {
      // Don't set Content-Type - let browser set multipart/form-data automatically
      ...(publishableKey && { "x-publishable-api-key": publishableKey }),
      ...authHeaders
    } as HeadersInit,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  const result = await response.json()
  
  // Revalidate cache
  const modelCacheTag = await getCacheTag("3d-models")
  revalidateTag(modelCacheTag)
  
  return result
}

export async function validateImages(files: FileList | File[]): Promise<{
  valid: boolean
  error?: string
  files?: File[]
}> {
  const filesArray = Array.from(files)
  
  if (filesArray.length !== 4) {
    return {
      valid: false,
      error: "Please select exactly 4 images"
    }
  }
  
  // Validate file types
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const invalidFiles = filesArray.filter(file => !validTypes.includes(file.type))
  
  if (invalidFiles.length > 0) {
    return {
      valid: false,
      error: "Please select only JPEG, PNG, or WebP images"
    }
  }

  // Check file sizes (10MB limit each)
  const maxSize = 10 * 1024 * 1024 // 10MB
  const oversizedFiles = filesArray.filter(file => file.size > maxSize)
  
  if (oversizedFiles.length > 0) {
    return {
      valid: false,
      error: "Each image must be smaller than 10MB"
    }
  }

  return {
    valid: true,
    files: filesArray
  }
}

/**
 * Poll the server for job status
 */
export async function pollJobStatus(jobId: string): Promise<JobStatusResponse> {
  const authHeaders = await getAuthHeaders()
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  
  // Create an AbortController instance
  const controller = new AbortController()
  // Set a 90-second timeout
  const timeoutId = setTimeout(() => controller.abort(), 90000)
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/threed-jobs/${jobId}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        ...(publishableKey && { "x-publishable-api-key": publishableKey }),
        ...authHeaders
      },
      cache: 'no-store',
      signal: controller.signal // Pass the signal to the fetch request
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("Error polling job status:", error)
    throw error
  }
}

/**
 * Start polling for job completion
 */
export async function pollUntilCompletion(jobId: string, onProgress?: (progress: number) => void): Promise<JobStatusResponse> {
  let attempts = 0
  
  const poll = async (): Promise<JobStatusResponse> => {
    if (attempts >= MAX_POLLING_ATTEMPTS) {
      throw new Error('Job polling timed out after maximum attempts')
    }
    
    attempts++
    const result = await pollJobStatus(jobId)
    
    // Update progress if callback provided
    if (onProgress && typeof result.progress === 'number') {
      onProgress(result.progress)
    }
    
    // If job is completed or failed, return the result
    if (result.status === 'completed' || result.status === 'failed') {
      return result
    }
    
    // Otherwise, wait and poll again
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL))
    return poll()
  }
  
  return poll()
}

export async function submitModelGeneration(
  currentState: unknown,
  formData: FormData
) {
  try {
    // Validate the form data has 4 files
    const files = formData.getAll('files') as File[]
    
    if (files.length !== 4) {
      return {
        success: false,
        error: "Please select exactly 4 images"
      }
    }

    // Call the generation function
    const result = await generate3DModel(formData)
    
    // If the job was started successfully, return the job ID for polling
    if (result.success && 'job_id' in result) {
      return {
        ...result,
        job_id: result.job_id,
        polling_required: true
      }
    }
    
    return result
  } catch (error: any) {
    console.error("Error in submitModelGeneration:", error)
    return {
      success: false,
      error: error.message || "Failed to process 3D model generation"
    }
  }
}