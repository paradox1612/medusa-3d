// backend/src/api/store/gallery/upload/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadGalleryItemWorkflow } from "../../../../workflows/upload-gallery-item"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import { MedusaError } from "@medusajs/framework/utils"

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`
      ))
    }
  }
})

export const config = {
  api: {
    bodyParser: false,
  },
}
// Update the POST handler in route.ts
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Handle file upload
    upload.single('image')(req as any, res as any, async (err) => {
      try {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              error: "File too large. Maximum size is 10MB." 
            })
          }
          return res.status(400).json({ 
            error: err.message || "Error uploading file" 
          })
        }

        const file = req.file
        if (!file) {
          return res.status(400).json({ 
            error: "No file uploaded" 
          })
        }

        // Debug: Log file details
        console.log('File received:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          bufferType: file.buffer?.constructor?.name,
          bufferLength: file.buffer?.length,
          bufferSample: file.buffer?.toString('hex', 0, 20) // First 20 bytes as hex
        });

        // Get form data
        const { title = "", description = "" } = req.body as { title?: string; description?: string }

        // Call the workflow with the correct parameters
        const { result } = await uploadGalleryItemWorkflow(req.scope).run({
          input: {
            file: {
              buffer: file.buffer,  // This is the Buffer object
              filename: file.originalname,
              mimetype: file.mimetype
            },
            title,
            description
          }
        })

        res.status(201).json({ 
          success: true,
          galleryItem: result 
        })

      } catch (error) {
        console.error("Error in upload handler:", error)
        res.status(500).json({ 
          error: error.message || "Failed to process gallery upload" 
        })
      }
    })
  } catch (error) {
    console.error("Unexpected error in gallery upload:", error)
    res.status(500).json({ 
      error: "An unexpected error occurred" 
    })
  }
}

