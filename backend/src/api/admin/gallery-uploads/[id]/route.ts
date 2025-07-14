// backend/src/api/admin/gallery-uploads/[id]/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GALLERY_MODULE } from "../../../../modules/gallery"
import GalleryModuleService from "../../../../modules/gallery/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Gallery item ID is required"
      })
    }

    // Get the gallery service
    const galleryService: GalleryModuleService = req.scope.resolve(GALLERY_MODULE)
    
    try {
      const item = await galleryService.retrieveGalleryUpload(id)

      if (!item) {
        return res.status(404).json({
          success: false,
          error: "Gallery item not found"
        })
      }

      res.json({
        success: true,
        item
      })

    } catch (retrieveError) {
      if (retrieveError.message?.includes("not found") || retrieveError.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          error: "Gallery item not found"
        })
      }
      throw retrieveError
    }

  } catch (error) {
    console.error("Error fetching gallery item for admin:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch gallery item"
    })
  }
}

export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params
    const { title, description, status } = req.body as {
      title?: string
      description?: string
      status?: 'pending' | 'approved' | 'rejected'
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Gallery item ID is required"
      })
    }

    // Validate status if provided
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'pending', 'approved', or 'rejected'"
      })
    }

    // Get the gallery service
    const galleryService: GalleryModuleService = req.scope.resolve(GALLERY_MODULE)
    
    try {
      // Check if item exists first
      const existingItem = await galleryService.retrieveGalleryUpload(id)
      
      if (!existingItem) {
        return res.status(404).json({
          success: false,
          error: "Gallery item not found"
        })
      }

      // Build update data
      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (status !== undefined) updateData.status = status

      // Update the gallery item
      const updatedItem = await galleryService.update(id, updateData)

      res.json({
        success: true,
        item: updatedItem
      })

    } catch (retrieveError) {
      if (retrieveError.message?.includes("not found") || retrieveError.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          error: "Gallery item not found"
        })
      }
      throw retrieveError
    }

  } catch (error) {
    console.error("Error updating gallery item:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update gallery item"
    })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Gallery item ID is required"
      })
    }

    // Get the gallery service
    const galleryService: GalleryModuleService = req.scope.resolve(GALLERY_MODULE)
    
    try {
      // Check if item exists first
      const existingItem = await galleryService.retrieveGalleryUpload(id)
      
      if (!existingItem) {
        return res.status(404).json({
          success: false,
          error: "Gallery item not found"
        })
      }

      // Soft delete the gallery item
      await galleryService.softDeleteGalleryUploads([id])

      res.json({
        success: true,
        message: "Gallery item deleted successfully"
      })

    } catch (retrieveError) {
      if (retrieveError.message?.includes("not found") || retrieveError.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          error: "Gallery item not found"
        })
      }
      throw retrieveError
    }

  } catch (error) {
    console.error("Error deleting gallery item:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete gallery item"
    })
  }
}