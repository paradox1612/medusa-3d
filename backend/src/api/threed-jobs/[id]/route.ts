// backend/src/api/threed-jobs/[id]/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { THREED_JOB_MODULE } from "../../../modules/threed-job"
import ThreeDJobModuleService from "../../../modules/threed-job/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const threeDJobModuleService = req.scope.resolve<ThreeDJobModuleService>(THREED_JOB_MODULE)
  const { id } = req.params
  
  try {
    const job = await threeDJobModuleService.retrieveThreeDJob(id)
    
    if (!job) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `3D job with id ${id} not found`
      )
    }
    
    // Format response to match the 3D model API structure
    const response = {
      success: true,
      job: {
        id: job.id,
        status: job.status,
        prediction_id: job.prediction_id,
        model_url: job.model_url,
        original_model_url: job.original_model_url,
        uploaded_images: job.uploaded_images || [],
        compression_stats: job.compression_stats || [],
        processing_time: job.processing_time,
        error_message: job.error_message,
        created_at: job.created_at,
        updated_at: job.updated_at,
        metadata: job.metadata || {}
      }
    }
    
    res.json(response)
  } catch (error) {
    console.error(`Error retrieving 3D job ${id}:`, error)
    
    if (error instanceof MedusaError) {
      res.status(400).json({
        success: false,
        error: error.message,
        type: error.type
      })
    } else {
      res.status(500).json({
        success: false,
        error: `Failed to retrieve 3D job: ${error.message}`
      })
    }
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const threeDJobModuleService = req.scope.resolve<ThreeDJobModuleService>(THREED_JOB_MODULE)
  const { id } = req.params
  
  try {
    // Check if job exists
    const existingJob = await threeDJobModuleService.retrieveThreeDJob(id)
    if (!existingJob) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `3D job with id ${id} not found`
      )
    }
    
    // Only allow specific fields to be updated
    const allowedUpdates = [
      'status', 
      'model_url', 
      'original_model_url', 
      'processing_time', 
      'error_message',
      'metadata',
      'synexa_data'
    ]
    
    const updates: Record<string, any> = { id }
    
    // Ensure req.body is an object
    if (typeof req.body !== 'object' || req.body === null) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Request body must be a JSON object'
      )
    }
    
    // Filter and validate updates
    for (const [key, value] of Object.entries(req.body as Record<string, unknown>)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = value
      }
    }
    
    // Special handling for status updates
    if (updates.status) {
      const validStatuses = ['pending', 'processing', 'completed', 'failed']
      if (!validStatuses.includes(updates.status)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid status: ${updates.status}. Must be one of: ${validStatuses.join(', ')}`
        )
      }
      
      // If marking as failed, ensure error_message is provided
      if (updates.status === 'failed' && !updates.error_message && !existingJob.error_message) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          'error_message is required when status is set to failed'
        )
      }
    }
    
    // Update the job
    const updatedJob = await threeDJobModuleService.updateThreeDJobs(updates)
    
    // Format response
    const response = {
      success: true,
      job: {
        id: updatedJob.id,
        status: updatedJob.status,
        prediction_id: updatedJob.prediction_id,
        model_url: updatedJob.model_url,
        original_model_url: updatedJob.original_model_url,
        processing_time: updatedJob.processing_time,
        error_message: updatedJob.error_message,
        updated_at: updatedJob.updated_at,
        metadata: updatedJob.metadata || {}
      }
    }
    
    res.json(response)
  } catch (error) {
    console.error(`Error updating 3D job ${id}:`, error)
    
    if (error instanceof MedusaError) {
      res.status(400).json({
        success: false,
        error: error.message,
        type: error.type
      })
    } else {
      res.status(500).json({
        success: false,
        error: `Failed to update 3D job: ${error.message}`
      })
    }
  }
}
