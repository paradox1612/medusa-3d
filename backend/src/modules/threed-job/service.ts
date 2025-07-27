import { MedusaService } from "@medusajs/framework/utils"
import { ThreeDJob } from "./models/threed-job"

type ThreeDJobStatus = "pending" | "processing" | "completed" | "failed"

interface CreateThreeDJobInput {
  session_id?: string
  user_id?: string
  username?: string
  ip_address: string
  status?: ThreeDJobStatus
  prediction_id?: string
  model_url?: string
  original_model_url?: string
  uploaded_images?: any
  compression_stats?: any
  processing_time?: number
  error_message?: string
  synexa_data?: any
  metadata?: any
}

interface UpdateThreeDJobInput {
  id: string
  session_id?: string
  user_id?: string
  username?: string
  ip_address?: string
  status?: ThreeDJobStatus
  prediction_id?: string
  model_url?: string
  original_model_url?: string
  uploaded_images?: any
  compression_stats?: any
  processing_time?: number
  error_message?: string
  synexa_data?: any
  metadata?: any
}

class ThreeDJobModuleService extends MedusaService({
  ThreeDJob,
}) {
  // Custom methods can be added here
  
  async createJob(data: CreateThreeDJobInput) {
    return await this.createThreeDJobs(data)
  }
  
  async updateJobStatus(id: string, status: ThreeDJobStatus, error_message?: string) {
    return await this.updateThreeDJobs({
      id,
      status,
      ...(error_message && { error_message })
    })
  }
  
  async getJobsByStatus(status: ThreeDJobStatus) {
    return await this.listThreeDJobs({
      status
    })
  }
  
  async getJobsByUser(user_id: string) {
    return await this.listThreeDJobs({
      user_id
    })
  }
  
  async getJobsBySession(session_id: string) {
    return await this.listThreeDJobs({
      session_id
    })
  }
  
  async completeJob(id: string, model_url: string, compression_stats?: any, processing_time?: number) {
    return await this.updateThreeDJobs({
      id,
      status: "completed",
      model_url,
      ...(compression_stats && { compression_stats }),
      ...(processing_time && { processing_time })
    })
  }
  
  async failJob(id: string, error_message: string) {
    return await this.updateThreeDJobs({
      id,
      status: "failed",
      error_message
    })
  }
}

export default ThreeDJobModuleService
