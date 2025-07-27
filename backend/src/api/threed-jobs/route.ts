// backend/src/api/threed-jobs/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import sharp from "sharp"
import { THREED_JOB_MODULE } from "../../modules/threed-job"
import ThreeDJobModuleService from "../../modules/threed-job/service"

interface SynexaApiResponse {
  id: string
  model: string
  version: string | null
  input: {
    seed: number
    image: string
    steps: number
    caption: string
    shape_only: boolean
    guidance_scale: number
    multiple_views: (string | null)[]
    check_box_rembg: boolean
    octree_resolution: string
  }
  logs: string | null
  output: string[] | null
  error: string | null
  status: "starting" | "processing" | "succeeded" | "failed"
  created_at: string
  started_at: string | null
  completed_at: string | null
  metrics: { predict_time?: number } | null
}

// Environment variables for Synexa AI
const SYNEXA_API_KEY = process.env.SYNEXA_API_KEY || ""
const SYNEXA_BASE_URL = "https://api.synexa.ai/v1"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const threeDJobModuleService = req.scope.resolve<ThreeDJobModuleService>(THREED_JOB_MODULE)
  
  const { status, user_id, session_id } = req.query
  
  let jobs
  try {
    if (status) {
      jobs = await threeDJobModuleService.getJobsByStatus(status as "pending" | "processing" | "completed" | "failed")
    } else if (user_id) {
      jobs = await threeDJobModuleService.getJobsByUser(user_id as string)
    } else if (session_id) {
      jobs = await threeDJobModuleService.getJobsBySession(session_id as string)
    } else {
      jobs = await threeDJobModuleService.listThreeDJobs()
    }
    
    res.json({ jobs })
  } catch (error) {
    console.error("Error fetching 3D jobs:", error)
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch 3D jobs",
      details: error.message 
    })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const threeDJobModuleService = req.scope.resolve<ThreeDJobModuleService>(THREED_JOB_MODULE)
  
  try {
    console.log("🚀 ThreeD Job API called with file processing")
    console.log("Request body:", req.body)
    console.log("Request files:", req.files)
    console.log("Content-Type:", req.headers['content-type'])
    
    const files = req.files as Express.Multer.File[]
    const body = req.body as any
    const { caption = "", steps = 20, guidance_scale = 7.5, octree_resolution = "256", user_id, session_id, username } = body

    // Get client IP
    const ip_address = req.ip || (req.connection as any).remoteAddress || "unknown"

    console.log(`✅ Received ${files?.length || 0} files for 3D model generation`)
    console.log("📎 Files detail:", files?.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype })))

    // Validate that we have exactly 4 images
    if (!files?.length || files.length !== 4) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Exactly 4 images are required for 3D model generation"
      )
    }

    // Validate API key
    if (!SYNEXA_API_KEY) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Synexa API key not configured"
      )
    }

    // Create initial job record
    const job = await threeDJobModuleService.createJob({
      session_id,
      user_id,
      username,
      ip_address,
      status: "pending",
      metadata: {
        request_params: {
          caption,
          steps: parseInt(steps) || 20,
          guidance_scale: parseFloat(guidance_scale) || 7.5,
          octree_resolution: octree_resolution || "256"
        }
      }
    })

    console.log(`Created ThreeD job with ID: ${job.id}`)

    // Return job ID immediately
    res.status(202).json({
      success: true,
      message: "3D model generation job started",
      job_id: job.id,
      status: "pending",
      estimated_completion_time: "2-5 minutes",
      polling_endpoint: `/store/threed-jobs/${job.id}`
    })

    // Start background processing (don't await this)
    processThreeDModelInBackground(
      job.id,
      files,
      {
        caption,
        steps: parseInt(steps) || 20,
        guidance_scale: parseFloat(guidance_scale) || 7.5,
        octree_resolution: octree_resolution || "256"
      },
      req.scope
    ).catch(error => {
      console.error(`Background processing failed for job ${job.id}:`, error)
    })

  } catch (error) {
    console.error("3D model job creation error:", error)
    
    if (error instanceof MedusaError) {
      res.status(400).json({
        success: false,
        error: error.message,
        type: error.type
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error during job creation",
        details: error.message
      })
    }
  }
}

// Background processing function
async function processThreeDModelInBackground(
  jobId: string,
  files: Express.Multer.File[],
  params: {
    caption: string
    steps: number
    guidance_scale: number
    octree_resolution: string
  },
  scope: any
) {
  const threeDJobModuleService = scope.resolve(THREED_JOB_MODULE)
  const startTime = Date.now()

  try {
    console.log(`🔄 Starting background processing for job ${jobId}`)

    // Update job status to processing
    await threeDJobModuleService.updateJobStatus(jobId, "processing")

    // Store compressed image data with compression metrics
    const compressedImageData: Array<{
      buffer: Buffer
      filename: string
      originalSize: number
      compressedSize: number
      compressionRatio: number
    }> = []

    // Helper function to compress an image with specified settings
    const compressImage = async (buffer: Buffer, width: number, quality: number) => {
      return await sharp(buffer)
        .resize(width, width, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer()
    }

    // Process each file with conditional compression
    const compressedFiles = await Promise.all(
      files.map(async (file, index) => {
        try {
          const TEN_MB = 10 * 1024 * 1024 // 10MB in bytes
          const fileSizeMB = file.buffer.length / (1024 * 1024)
          let finalBuffer = file.buffer
          let finalSize = file.buffer.length
          
          // Only compress if file is larger than 10MB
          if (file.buffer.length > TEN_MB) {
            console.log(`🔄 Compressing ${file.originalname} (${fileSizeMB.toFixed(2)}MB)`)
            
            // First compression pass
            const compressedBuffer = await compressImage(file.buffer, 1024, 85)
            let sizeAfterFirstPassMB = compressedBuffer.length / (1024 * 1024)
            
            // If still larger than 5MB, do a second, more aggressive compression
            if (sizeAfterFirstPassMB > 5) {
              console.log(`🔄 Further compressing ${file.originalname} (${sizeAfterFirstPassMB.toFixed(2)}MB after first pass)`)
              const furtherCompressed = await compressImage(compressedBuffer, 800, 75)
              finalBuffer = furtherCompressed
              finalSize = furtherCompressed.length
            } else {
              finalBuffer = compressedBuffer
              finalSize = compressedBuffer.length
            }
            
            console.log(`✅ Compressed ${file.originalname} from ${fileSizeMB.toFixed(2)}MB to ${(finalSize / (1024 * 1024)).toFixed(2)}MB`)
          } else {
            console.log(`⏩ Skipping compression for ${file.originalname} (${fileSizeMB.toFixed(2)}MB is under 10MB threshold)`)
          }

          // Generate a safe filename with original extension or default to .jpg
          const fileExt = file.originalname.includes('.') 
            ? file.originalname.split('.').pop() 
            : 'jpg'
          const safeFilename = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
          const filename = `compressed_${index + 1}_${safeFilename}`
          
          // Store compression results
          compressedImageData.push({
            buffer: finalBuffer,
            filename: filename,
            originalSize: file.buffer.length,
            compressedSize: finalSize,
            compressionRatio: (1 - (finalSize / file.buffer.length)) * 100
          })
          
          console.log(`📊 Compression stats for ${file.originalname}: ` +
            `${(file.buffer.length / (1024 * 1024)).toFixed(2)}MB → ` +
            `${(finalSize / (1024 * 1024)).toFixed(2)}MB ` +
            `(${((1 - (finalSize / file.buffer.length)) * 100).toFixed(1)}% reduction)`)

          return {
            filename: filename,
            mimeType: "image/jpeg",
            content: finalBuffer.toString("binary"),
            access: "public" as const,
            originalSize: file.buffer.length,
            compressedSize: finalSize
          }
        } catch (error) {
          console.error(`Error compressing image ${index + 1}:`, error)
          throw new Error(`Failed to compress image ${index + 1}: ${error.message}`)
        }
      })
    )

    // Upload compressed files to storage
    console.log(`📁 Uploading compressed images for job ${jobId}...`)
    const { result: uploadedFiles } = await uploadFilesWorkflow(scope).run({
      input: {
        files: compressedFiles,
      },
    })

    console.log(`✅ Successfully uploaded ${uploadedFiles.length} images for job ${jobId}`)

    // Prepare data for job update
    const uploadedImagesData = uploadedFiles.map((file, index) => ({
      url: file.url,
      filename: file.id,
      base64: `data:image/jpeg;base64,${compressedImageData[index]?.buffer.toString('base64')}`,
      size_mb: (compressedImageData[index]?.compressedSize / (1024 * 1024)).toFixed(2)
    }))

    const compressionStats = compressedFiles.map(file => ({
      filename: file.filename,
      original_size_mb: (file.originalSize / (1024 * 1024)).toFixed(2),
      compressed_size_mb: (file.compressedSize / (1024 * 1024)).toFixed(2),
      compression_ratio: ((1 - file.compressedSize / file.originalSize) * 100).toFixed(1) + "%"
    }))

    // Update job with uploaded images
    await threeDJobModuleService.updateThreeDJobs({
      id: jobId,
      uploaded_images: uploadedImagesData,
      compression_stats: compressionStats
    })

    // Prepare URLs for Synexa AI
    const imageUrls = uploadedFiles.map(file => file.url)
    const [mainImage, ...multipleViews] = imageUrls
    const paddedMultipleViews = [
      multipleViews[0] || null,
      multipleViews[1] || null,
      multipleViews[2] || null
    ]

    // Call Synexa AI API
    console.log(`🤖 Calling Synexa AI for job ${jobId}...`)
    const synexaResponse = await fetch(`${SYNEXA_BASE_URL}/predictions`, {
      method: "POST",
      headers: {
        "x-api-key": SYNEXA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tencent/hunyuan3d-2",
        input: {
          seed: Math.floor(Math.random() * 10000),
          image: mainImage,
          multiple_views: paddedMultipleViews,
          caption: params.caption || "",
          steps: params.steps,
          shape_only: false,
          guidance_scale: params.guidance_scale,
          check_box_rembg: true,
          octree_resolution: params.octree_resolution
        }
      })
    })

    if (!synexaResponse.ok) {
      const errorText = await synexaResponse.text()
      throw new Error(`Synexa AI API error: ${synexaResponse.status} - ${errorText}`)
    }

    const synexaData: SynexaApiResponse = await synexaResponse.json()
    console.log(`🎯 3D generation started for job ${jobId}, prediction ID: ${synexaData.id}`)

    // Update job with prediction ID
    await threeDJobModuleService.updateThreeDJobs({
      id: jobId,
      prediction_id: synexaData.id,
      synexa_data: synexaData
    })

    // Poll for completion
    console.log(`⏳ Polling for completion of job ${jobId}...`)
    const maxAttempts = 60 // 5 minutes
    let attempts = 0
    let finalResult: SynexaApiResponse = synexaData

    while (attempts < maxAttempts) {
      if (finalResult.status === "succeeded" || finalResult.status === "failed") {
        break
      }

      await new Promise(resolve => setTimeout(resolve, 5000))
      attempts++

      try {
        const statusResponse = await fetch(`${SYNEXA_BASE_URL}/predictions/${synexaData.id}`, {
          headers: {
            "x-api-key": SYNEXA_API_KEY,
            "Content-Type": "application/json",
          }
        })

        if (statusResponse.ok) {
          finalResult = await statusResponse.json()
          console.log(`📊 Job ${jobId} poll ${attempts}: ${finalResult.status}`)
          
          // Update job with latest status
          await threeDJobModuleService.updateThreeDJobs({
            id: jobId,
            synexa_data: finalResult
          })
        }
      } catch (error) {
        console.error(`❌ Status check error for job ${jobId}, attempt ${attempts}:`, error)
      }
    }

    // Handle completion
    if (finalResult.status === "failed") {
      throw new Error(finalResult.error || "3D model generation failed")
    }

    if (finalResult.status !== "succeeded") {
      throw new Error(`Generation timed out. Status: ${finalResult.status}`)
    }

    // Download and upload 3D model
    let uploadedModelUrl: string | null = null
    const originalModelUrl = finalResult.output?.[0] || null
    let isUploadedToStorage = false

    if (originalModelUrl) {
      try {
        console.log(`📥 Downloading 3D model for job ${jobId}...`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        const modelResponse = await fetch(originalModelUrl, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (modelResponse.ok) {
          const modelBuffer = await modelResponse.arrayBuffer()
          const modelFileName = `3d_model_${finalResult.id}.glb`
          
          if (modelBuffer.byteLength <= 10 * 1024 * 1024) { // Under 10MB
            const nodeBuffer = Buffer.from(modelBuffer)
            
            try {
              const { result: uploadedModel } = await uploadFilesWorkflow(scope).run({
                input: {
                  files: [{
                    filename: modelFileName,
                    mimeType: "model/gltf-binary",
                    content: nodeBuffer.toString("binary"),
                    access: "public" as const
                  }]
                }
              })
              uploadedModelUrl = uploadedModel[0]?.url || null
              isUploadedToStorage = true
              console.log(`✅ 3D model uploaded for job ${jobId}`)
            } catch (uploadError) {
              console.warn(`⚠️ Upload failed for job ${jobId}, using original URL`)
              uploadedModelUrl = originalModelUrl
            }
          } else {
            console.warn(`⚠️ Model too large for job ${jobId}, using original URL`)
            uploadedModelUrl = originalModelUrl
          }
        }
      } catch (error) {
        console.error(`❌ Download error for job ${jobId}:`, error)
        uploadedModelUrl = originalModelUrl
      }
    }

    // Complete the job
    const processingTime = Date.now() - startTime

    await threeDJobModuleService.updateThreeDJobs({
      id: jobId,
      status: "completed",
      model_url: uploadedModelUrl || originalModelUrl,
      original_model_url: originalModelUrl,
      processing_time: processingTime,
      synexa_data: finalResult,
      metadata: {
        is_uploaded_to_storage: isUploadedToStorage,
        synexa_processing_time: finalResult.metrics?.predict_time || null,
        upload_info: {
          attempted_upload: originalModelUrl ? true : false,
          upload_successful: isUploadedToStorage,
          fallback_used: !isUploadedToStorage && originalModelUrl ? true : false,
          storage_url: isUploadedToStorage ? uploadedModelUrl : null,
          external_url: originalModelUrl
        }
      }
    })

    console.log(`🎉 Job ${jobId} completed successfully in ${(processingTime / 1000).toFixed(1)}s`)

  } catch (error) {
    console.error(`❌ Background processing failed for job ${jobId}:`, error)
    
    // Update job as failed
    try {
      await threeDJobModuleService.failJob(jobId, error.message)
    } catch (updateError) {
      console.error(`Failed to update job ${jobId} as failed:`, updateError)
    }
  }
}
