// backend/src/api/store/gallery/route.ts
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
      status,
      search
    } = req.query as {
      limit?: string | number
      offset?: string | number
      status?: 'pending' | 'approved' | 'rejected'
      search?: string
    }

    // Parse limit and offset to numbers
    const parsedLimit = Math.min(parseInt(String(limit), 10) || 20, 100) // Max 100 items
    const parsedOffset = parseInt(String(offset), 10) || 0

    // Get the gallery service
    const galleryService: GalleryModuleService = req.scope.resolve(GALLERY_MODULE)
    
    let items: any[]
    let count: number

    // Handle search query
    if (search && typeof search === 'string' && search.trim()) {
      const searchResults = await galleryService.search(search.trim(), {
        skip: parsedOffset,
        take: parsedLimit
      })
      items = searchResults
      count = searchResults.length // Note: This won't be the total count for search
    } else {
      // Build filters for regular listing
      const filters: any = {}
      if (status) {
        filters.status = status
      }

      // Get gallery items with pagination
      const result = await galleryService.listAndCountGalleryUploads(
        filters,
        {
          skip: parsedOffset,
          take: parsedLimit,
          order: { created_at: "DESC" }
        }
      )
      
      items = result[0]
      count = result[1]
    }

    res.json({
      success: true,
      items,
      count,
      limit: parsedLimit,
      offset: parsedOffset,
      has_more: (parsedOffset + parsedLimit) < count
    })

  } catch (error) {
    console.error("Error fetching gallery items:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch gallery items"
    })
  }
}