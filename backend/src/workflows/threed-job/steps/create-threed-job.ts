import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { THREED_JOB_MODULE } from "../../../../src/modules/threed-job"
import ThreeDJobModuleService from "../../../../src/modules/threed-job/service"

interface CreateThreeDJobStepInput {
  session_id?: string
  user_id?: string
  username?: string
  ip_address: string
  uploaded_images?: any
  metadata?: any
}

export const createThreeDJobStep = createStep(
  "create-threed-job-step",
  async (input: CreateThreeDJobStepInput, { container }) => {
    const threeDJobModuleService = container.resolve<ThreeDJobModuleService>(THREED_JOB_MODULE)
    
    const job = await threeDJobModuleService.createJob({
      ...input,
      status: "pending"
    } as any) // Using any to bypass the type checking for now
    
    return new StepResponse(job, job.id)
  },
  async (jobId: string, { container }) => {
    const threeDJobModuleService = container.resolve<ThreeDJobModuleService>(THREED_JOB_MODULE)
    
    // Rollback: delete the created job
    await threeDJobModuleService.deleteThreeDJobs(jobId)
  }
)
