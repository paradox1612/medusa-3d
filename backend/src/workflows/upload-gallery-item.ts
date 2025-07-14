// /Users/kush-mac/Desktop/projects/ecom-3d/ecom-v1/medusa-3d/backend/src/workflows/upload-gallery-item.ts
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { GALLERY_MODULE } from "../modules/gallery"
import GalleryModuleService from "../modules/gallery/service"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"
import path from "path"

// Types
export type UploadGalleryItemStepInput = {
  fileBuffer: Buffer
  fileName: string
  fileMime: string
  title?: string
  description?: string
}

export type UploadGalleryItemWorkflowInput = {
  file: {
    buffer: Buffer
    filename: string
    mimetype: string
  }
  title?: string
  description?: string
}

// Step 1: Upload and process image
// In upload-gallery-item.ts
export const uploadAndProcessImageStep = createStep(
    "upload-and-process-image-step",
    async (input: UploadGalleryItemStepInput, { container }) => {
      // Reconstruct the buffer if it was serialized
      const fileBuffer = input.fileBuffer && input.fileBuffer.type === 'Buffer' && Array.isArray(input.fileBuffer.data)
        ? Buffer.from(input.fileBuffer.data)
        : input.fileBuffer;
  
      const { fileName, fileMime } = input;
      
      console.log('Workflow input:', {
        bufferType: fileBuffer?.constructor?.name,
        bufferLength: fileBuffer?.length,
        bufferSample: fileBuffer?.toString('hex', 0, 20)
      });
  
      try {
        // Process image with Sharp if it's an image
        let processedBuffer = fileBuffer;
        let processedMime = fileMime;
        let processedExt = path.extname(fileName).toLowerCase();
        
        if (fileMime.startsWith('image/')) {
          processedBuffer = await sharp(fileBuffer)
            .resize(1920, 1080, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ 
              quality: 85,
              progressive: true 
            })
            .toBuffer();
          processedMime = 'image/jpeg';
          processedExt = '.jpg';
        }
  
        // Rest of your code...

      // Generate unique filename with original extension for non-images, jpg for images
      const uniqueName = `${uuidv4()}${processedExt}`
      
      // Upload to S3 using uploadFilesWorkflow
      const { result: uploadedFiles } = await uploadFilesWorkflow(container).run({
        input: {
          files: [{
            filename: uniqueName,
            mimeType: processedMime,
            content: processedBuffer.toString("binary"),
            access: "public" as const
          }]
        }
      })

      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error("Failed to upload file to storage")
      }

      const fileUrl = uploadedFiles[0].url
      
      return new StepResponse({
        fileUrl,
        title: input.title,
        description: input.description
      }, { fileUrl })
      
    } catch (error) {
      console.error("Error in uploadAndProcessImageStep:", error)
      throw new Error(`Failed to process and upload image: ${error.message}`)
    }
  }
)

// Step 2: Create gallery item record
export const createGalleryItemStep = createStep(
  "create-gallery-item-step",
  async (input: { fileUrl: string, title?: string, description?: string }, { container }) => {
    const galleryService: GalleryModuleService = container.resolve(GALLERY_MODULE)
    
    const galleryItem = await galleryService.createGalleryUploads([{
      image_url: input.fileUrl,
      title: input.title,
      description: input.description,
      status: "pending"
    }])

    return new StepResponse(galleryItem[0], galleryItem[0].id)
  },
  async (id, { container }) => {
    // Compensation: Delete the gallery item if something fails
    if (id) {
      const galleryService: GalleryModuleService = container.resolve(GALLERY_MODULE)
      await galleryService.deleteGalleryUploads([id])
    }
  }
)

// Main workflow
export const uploadGalleryItemWorkflow = createWorkflow(
  "upload-gallery-item-workflow",
  (input: UploadGalleryItemWorkflowInput) => {
    // Step 1: Process and upload the image
    const { fileUrl } = uploadAndProcessImageStep({
      fileBuffer: input.file.buffer,
      fileName: input.file.filename,
      fileMime: input.file.mimetype,
      title: input.title,
      description: input.description
    })

    // Step 2: Create the gallery item record
    const galleryItem = createGalleryItemStep({
      fileUrl,
      title: input.title,
      description: input.description
    })

    return new WorkflowResponse(galleryItem)
  }
)