import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import sharp from "sharp"

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

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    console.log("🚀 3D Model API called with middleware configuration")
    console.log("Request body:", req.body)
    console.log("Request files:", req.files)
    console.log("Content-Type:", req.headers['content-type'])
    
    const files = req.files as Express.Multer.File[]
    const body = req.body as any
    const { caption = "", steps = 20, guidance_scale = 7.5, octree_resolution = "256" } = body

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

    // Compress images using Sharp (resize to max 1024x1024 and compress to <3MB)
    const compressedFiles = await Promise.all(
      files.map(async (file, index) => {
        try {
          const compressedBuffer = await sharp(file.buffer)
            .resize(1024, 1024, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ 
              quality: 85,
              progressive: true 
            })
            .toBuffer()

          // Check if compressed size is still > 3MB
          const sizeInMB = compressedBuffer.length / (1024 * 1024)
          if (sizeInMB > 3) {
            // Further compress if still too large
            const furtherCompressed = await sharp(file.buffer)
              .resize(800, 800, { 
                fit: 'inside', 
                withoutEnlargement: true 
              })
              .jpeg({ 
                quality: 70,
                progressive: true 
              })
              .toBuffer()
            
            console.log(`Image ${index + 1} compressed from ${(file.buffer.length / (1024 * 1024)).toFixed(2)}MB to ${(furtherCompressed.length / (1024 * 1024)).toFixed(2)}MB`)
            
            return {
              filename: `compressed_${index + 1}_${file.originalname.replace(/\.[^/.]+$/, ".jpg")}`,
              mimeType: "image/jpeg",
              content: furtherCompressed.toString("binary"),
              access: "public" as const,
              originalSize: file.buffer.length,
              compressedSize: furtherCompressed.length
            }
          }

          console.log(`Image ${index + 1} compressed from ${(file.buffer.length / (1024 * 1024)).toFixed(2)}MB to ${(compressedBuffer.length / (1024 * 1024)).toFixed(2)}MB`)

          return {
            filename: `compressed_${index + 1}_${file.originalname.replace(/\.[^/.]+$/, ".jpg")}`,
            mimeType: "image/jpeg",
            content: compressedBuffer.toString("binary"),
            access: "public" as const,
            originalSize: file.buffer.length,
            compressedSize: compressedBuffer.length
          }
        } catch (error) {
          console.error(`Error compressing image ${index + 1}:`, error)
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Failed to compress image ${index + 1}: ${error.message}`
          )
        }
      })
    )

    // Upload compressed files to storage
    console.log("Uploading compressed images to storage...")
    const { result: uploadedFiles } = await uploadFilesWorkflow(req.scope).run({
      input: {
        files: compressedFiles,
      },
    })

    console.log(`Successfully uploaded ${uploadedFiles.length} images to storage`)

    // Prepare URLs for Synexa AI
    const imageUrls = uploadedFiles.map(file => file.url)
    const [mainImage, ...multipleViews] = imageUrls

    // Pad multiple_views array to exactly 3 elements with null values
    const paddedMultipleViews = [
      multipleViews[0] || null,
      multipleViews[1] || null,
      multipleViews[2] || null
    ]
    console.log(`uploaded ${imageUrls} images to storage`)
    // Call Synexa AI API
    console.log("Calling Synexa AI API...")
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
          caption: caption || "",
          steps: parseInt(steps) || 20,
          shape_only: false,
          guidance_scale: parseFloat(guidance_scale) || 7.5,
          check_box_rembg: true,
          octree_resolution: octree_resolution || "256"
        }
      })
    })

    if (!synexaResponse.ok) {
      const errorText = await synexaResponse.text()
      console.error("Synexa AI API error:", errorText)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Synexa AI API error: ${synexaResponse.status} - ${errorText}`
      )
    }

    const synexaData: SynexaApiResponse = await synexaResponse.json()
    console.log(`3D model generation started with prediction ID: ${synexaData.id}`)

    // Poll for completion
    console.log("Polling for 3D model generation completion...")
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0
    let finalResult: SynexaApiResponse = synexaData

    while (attempts < maxAttempts) {
      if (finalResult.status === "succeeded" || finalResult.status === "failed") {
        break
      }

      // Wait 5 seconds before next poll
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
          console.log(`Poll attempt ${attempts}: Status = ${finalResult.status}`)
        } else {
          console.error(`Status check failed: ${statusResponse.status}`)
        }
      } catch (error) {
        console.error(`Error checking status on attempt ${attempts}:`, error)
      }
    }

    // Check final status
    if (finalResult.status === "failed") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `3D model generation failed: ${finalResult.error}`
      )
    }

    if (finalResult.status !== "succeeded") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `3D model generation timed out. Status: ${finalResult.status}`
      )
    }

    res.status(200).json({
      success: true,
      message: "3D model generated successfully",
      data: {
        prediction_id: finalResult.id,
        status: finalResult.status,
        model_url: finalResult.output?.[0] || null,
        uploaded_images: uploadedFiles.map(file => ({
          url: file.url,
          filename: (file as any).key || file.url.split('/').pop()
        })),
        compression_stats: compressedFiles.map(file => ({
          filename: file.filename,
          original_size_mb: (file.originalSize / (1024 * 1024)).toFixed(2),
          compressed_size_mb: (file.compressedSize / (1024 * 1024)).toFixed(2),
          compression_ratio: ((1 - file.compressedSize / file.originalSize) * 100).toFixed(1) + "%"
        })),
        processing_time: finalResult.metrics?.predict_time || null,
        created_at: finalResult.created_at,
        completed_at: finalResult.completed_at
      }
    })

  } catch (error) {
    console.error("3D model generation error:", error)
    
    if (error instanceof MedusaError) {
      res.status(400).json({
        success: false,
        error: error.message,
        type: error.type
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error during 3D model generation",
        details: error.message
      })
    }
  }
} 