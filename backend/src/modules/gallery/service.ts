// backend/src/modules/gallery/service.ts
import { MedusaService } from "@medusajs/framework/utils"
import { FindConfig } from "@medusajs/framework/types"
import GalleryUpload from "./models/gallery-upload"

type GalleryUploadData = {
  image_url: string
  title?: string | null
  description?: string | null
  status?: 'pending' | 'approved' | 'rejected'
}

type GalleryUploadUpdateData = Partial<Omit<GalleryUploadData, 'image_url'>>

// Define the proper type for the gallery upload entity based on your model
type GalleryUploadEntity = {
  id: string
  image_url: string
  title: string | null
  description: string | null
  status: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

class GalleryModuleService extends MedusaService({
  GalleryUpload,
}) {
  // Note: The auto-generated methods are:
  // - createGalleryUploads([...]) 
  // - listGalleryUploads(filters, config)
  // - retrieveGalleryUpload(id, config)
  // - updateGalleryUploads([...])
  // - deleteGalleryUploads([ids])
  // - softDeleteGalleryUploads([ids])
  // - listAndCountGalleryUploads(filters, config)

  // Custom method: List all gallery uploads with optional filters
  async listAll(
    selector: Record<string, any> = {}, 
    config: FindConfig<GalleryUploadEntity> = {}
  ) {
    return await this.listGalleryUploads(selector, {
      relations: [],
      order: { created_at: 'DESC' },
      ...config
    })
  }

  // Custom method: List with count using proper config
  async listWithCount(
    selector: Record<string, any> = {},
    config: FindConfig<GalleryUploadEntity> = {}
  ) {
    return await this.listAndCountGalleryUploads(selector, {
      relations: [],
      order: { created_at: 'DESC' },
      ...config
    })
  }

  // Custom method: Create a single gallery upload
  async create(data: GalleryUploadData) {
    const upload = await this.createGalleryUploads([{
      image_url: data.image_url,
      title: data.title || null,
      description: data.description || null,
      status: data.status || 'pending'
    }])
    return upload[0]
  }

  // Custom method: Update an existing gallery upload
  async update(id: string, data: GalleryUploadUpdateData) {
    const [updated] = await this.updateGalleryUploads([{
      id,
      ...data
    }])
    return updated
  }

  // Custom method: List approved gallery items for the storefront
  async listApproved(config: FindConfig<GalleryUploadEntity> = {}) {
    return await this.listGalleryUploads(
      { status: "approved" },
      {
        select: ['id', 'image_url', 'title', 'description', 'created_at'] as (keyof GalleryUploadEntity)[],
        relations: [],
        order: { created_at: 'DESC' },
        ...config
      }
    )
  }

  // Custom method: List pending gallery items (for admin approval)
  async listPending(config: FindConfig<GalleryUploadEntity> = {}) {
    return await this.listGalleryUploads(
      { status: "pending" },
      {
        relations: [],
        order: { created_at: 'ASC' }, // Oldest first for review
        ...config
      }
    )
  }

  // Custom method: Approve a gallery item
  async approve(id: string) {
    return await this.update(id, { status: 'approved' })
  }

  // Custom method: Reject a gallery item
  async reject(id: string) {
    return await this.update(id, { status: 'rejected' })
  }

  // Custom method: Get statistics
  async getStats() {
    const [, pendingCount] = await this.listAndCountGalleryUploads({ status: 'pending' })
    const [, approvedCount] = await this.listAndCountGalleryUploads({ status: 'approved' })
    const [, rejectedCount] = await this.listAndCountGalleryUploads({ status: 'rejected' })
    const [, totalCount] = await this.listAndCountGalleryUploads({})

    return {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      total: totalCount
    }
  }

  // Custom method: Get recent uploads (last 10)
  async getRecent() {
    return await this.listGalleryUploads(
      {},
      {
        take: 10,
        order: { created_at: 'DESC' }
      }
    )
  }

  // Custom method: Search by title or description
  async search(query: string, config: FindConfig<GalleryUploadEntity> = {}) {
    // Note: This is a basic implementation. For better search, you might want to use
    // a search module or implement full-text search at the database level
    const titleResults = await this.listGalleryUploads(
      { 
        title: { $ilike: `%${query}%` }
      },
      config
    )
    
    const descriptionResults = await this.listGalleryUploads(
      { 
        description: { $ilike: `%${query}%` }
      },
      config
    )

    // Combine and deduplicate results
    const allResults = [...titleResults, ...descriptionResults]
    const uniqueResults = allResults.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )

    return uniqueResults
  }
}

export default GalleryModuleService