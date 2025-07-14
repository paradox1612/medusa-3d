import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "../config"

export interface GalleryUploadData {
  image: File
  title?: string
  description?: string
}

export interface GalleryItem {
  id: string
  image_url: string
  title: string | null
  description: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface GalleryUploadResponse {
  success: boolean
  galleryItem: GalleryItem
}

export interface GalleryListResponse {
  success: boolean
  items: GalleryItem[]
  count: number
}

// Helper function to get headers with proper type safety
function getHeaders(includeContentType: boolean = true): HeadersInit {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error('MEDUSA_PUBLISHABLE_KEY is not configured')
  }

  const headers: Record<string, string> = {
    'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
  }

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

/**
 * Upload a new image to the gallery
 */
export async function uploadToGallery(data: GalleryUploadData): Promise<GalleryUploadResponse> {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error('MEDUSA_PUBLISHABLE_KEY is not configured')
  }

  const formData = new FormData()
  formData.append('image', data.image)
  
  if (data.title) {
    formData.append('title', data.title)
  }
  
  if (data.description) {
    formData.append('description', data.description)
  }

  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/gallery/upload`, {
    method: 'POST',
    headers: {
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Upload failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Get gallery items with optional pagination and filtering
 */
export async function getGalleryItems(params?: {
  limit?: number
  offset?: number
  status?: 'pending' | 'approved' | 'rejected'
}): Promise<GalleryListResponse> {
  const searchParams = new URLSearchParams()
  
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString())
  }
  
  if (params?.offset) {
    searchParams.set('offset', params.offset.toString())
  }
  
  if (params?.status) {
    searchParams.set('status', params.status)
  }

  const url = `${MEDUSA_BACKEND_URL}/store/gallery${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch gallery items with status ${response.status}`)
  }

  return response.json()
}

/**
 * Get a single gallery item by ID
 */
export async function getGalleryItem(id: string): Promise<{ success: boolean; item: GalleryItem }> {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/gallery/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch gallery item with status ${response.status}`)
  }

  return response.json()
}

/**
 * Delete a gallery item (if user has permission)
 */
export async function deleteGalleryItem(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/gallery/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to delete gallery item with status ${response.status}`)
  }

  return response.json()
}