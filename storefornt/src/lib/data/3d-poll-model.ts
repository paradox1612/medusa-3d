// src/lib/data/3d-poll-model.ts
"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
} from "./cookies"

// Type definitions for ThreeD Jobs
interface ThreeDJobResponse {
  success: boolean
  job: {
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

interface ThreeDJobCreationResponse {
  success: boolean
  message?: string
  job_id: string
  status: 'pending'
  estimated_completion_time?: string
  polling_endpoint?: string
  error?: string
}

/**
 * Create a new 3D model generation job using the threed-jobs endpoint
 * This is the ONLY server action - it creates the job and returns immediately
 */
export async function createThreeDJob(formData: FormData): Promise<ThreeDJobCreationResponse> {
  const authHeaders = await getAuthHeaders()
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  
  console.log("🚀 Creating ThreeD job with FormData:", {
    files: formData.getAll('files').length,
    keys: Array.from(formData.keys()),
    hasPublishableKey: !!publishableKey
  })
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/threed-jobs`, {
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
      console.error("❌ ThreeD job creation failed:", errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ ThreeD job created successfully:", result)
    
    return result
  } catch (error: any) {
    console.error("❌ Error creating ThreeD job:", error)
    throw new Error(`Failed to create 3D job: ${error.message}`)
  }
}

/**
 * Server action for form submission (compatible with useActionState)
 * This ONLY creates the job and returns immediately - no polling!
 */
export async function submitThreeDModelGeneration(
  currentState: unknown,
  formData: FormData
): Promise<ThreeDJobCreationResponse | { success: false; error: string }> {
  try {
    console.log("📤 Server action: submitThreeDModelGeneration called")
    
    // Validate the form data has 4 files
    const files = formData.getAll('files') as File[]
    
    if (files.length !== 4) {
      return {
        success: false,
        error: "Please select exactly 4 images"
      }
    }
    
    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type: ${file.type}. Please use JPEG, PNG, or WebP.`
        }
      }
      
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`
        }
      }
    }
    
    console.log("✅ Server-side validation passed")
    
    // Create the job (returns immediately with job_id)
    const result = await createThreeDJob(formData)
    
    console.log("✅ Server action completed, returning job creation result")
    return result
    
  } catch (error: any) {
    console.error("❌ Error in submitThreeDModelGeneration:", error)
    return {
      success: false,
      error: error.message || "Failed to create 3D model generation job"
    }
  }
}

/**
 * Validate images before upload (can be used client-side via server action)
 */
export async function validateThreeDImages(files: FileList | File[]): Promise<{
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
      error: `Invalid file types found. Please use only JPEG, PNG, or WebP images. Found: ${invalidFiles.map(f => f.type).join(', ')}`
    }
  }

  // Check file sizes (10MB limit each)
  const maxSize = 10 * 1024 * 1024 // 10MB
  const oversizedFiles = filesArray.filter(file => file.size > maxSize)
  
  if (oversizedFiles.length > 0) {
    const oversizedNames = oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join(', ')
    return {
      valid: false,
      error: `Files too large: ${oversizedNames}. Each image must be smaller than 10MB.`
    }
  }

  return {
    valid: true,
    files: filesArray
  }
}

/**
 * Single job status check (for client-side polling)
 * This runs on the server but is called from client-side polling
 */
export async function getThreeDJobStatus(jobId: string): Promise<ThreeDJobResponse> {
  const authHeaders = await getAuthHeaders()
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/threed-jobs/${jobId}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        ...(publishableKey && { "x-publishable-api-key": publishableKey }),
        ...authHeaders
      },
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    // Validate response structure
    if (!data.success || !data.job) {
      throw new Error("Invalid response format from ThreeD job API")
    }
    
    return data
  } catch (error: any) {
    console.error("❌ Error fetching ThreeD job status:", error)
    throw error
  }
}

/**
 * Get list of recent ThreeD jobs (optional - for job history)
 */
export async function getThreeDJobHistory(limit: number = 10): Promise<ThreeDJobResponse['job'][]> {
  const authHeaders = await getAuthHeaders()
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/threed-jobs?limit=${limit}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        ...(publishableKey && { "x-publishable-api-key": publishableKey }),
        ...authHeaders
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch job history: ${response.statusText}`)
    }

    const data = await response.json()
    return data.jobs || []
  } catch (error: any) {
    console.error("❌ Failed to fetch ThreeD job history:", error)
    return []
  }
}

/*
 * KEY CHANGES MADE:
 * 
 * 1. **Removed All Polling from Server Actions**:
 *    - No more pollThreeDJobUntilCompletion server function
 *    - No more generateAndPollThreeDModel server function
 *    - Server actions only create jobs and return immediately
 * 
 * 2. **Simplified Server Action Flow**:
 *    - submitThreeDModelGeneration: Creates job, returns job_id
 *    - validateThreeDImages: Validates files before upload
 *    - getThreeDJobStatus: Single status check (for client polling)
 * 
 * 3. **Server Actions Best Practices**:
 *    - Short-lived operations only
 *    - Return immediately after job creation
 *    - No long-running processes in server actions
 *    - Proper error handling and validation
 * 
 * 4. **Clean Separation of Concerns**:
 *    - Server: Job creation and single status checks
 *    - Client: Polling, progress tracking, UI updates
 * 
 * Usage:
 * - Server action creates job and returns job_id
 * - Client starts polling using separate client-side function
 * - Polling updates UI in real-time
 * - No "temporary Client Reference" errors
 */