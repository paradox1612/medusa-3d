// backend/src/api/admin/gallery-uploads/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GALLERY_MODULE } from "../../../modules/gallery"
import GalleryModuleService from "../../../modules/gallery/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Get query parameters
    const { 
      limit = 20, 
      offset = 0, 
      status 
    } = req.query as {
      limit?: string | number
      offset?: string | number
      status?: 'pending' | 'approved' | 'rejected' | 'all'
    }

    // Parse limit and offset to numbers
    const parsedLimit = Math.min(parseInt(String(limit), 10) || 20, 100) // Max 100 items
    const parsedOffset = parseInt(String(offset), 10) || 0

    // Get the gallery service
    const galleryService: GalleryModuleService = req.scope.resolve(GALLERY_MODULE)
    
    // Build filters
    const filters: any = {}
    if (status && status !== 'all') {
      filters.status = status
    }

    // Get gallery items with pagination
    const [items, count] = await galleryService.listAndCountGalleryUploads(
      filters,
      {
        skip: parsedOffset,
        take: parsedLimit,
        order: { created_at: "DESC" }
      }
    )

    res.json({
      success: true,
      items,
      count,
      limit: parsedLimit,
      offset: parsedOffset
    })

  } catch (error) {
    console.error("Error fetching gallery items for admin:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch gallery items"
    })
  }
}