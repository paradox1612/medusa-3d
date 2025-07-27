import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createThreeDJobStep } from "./steps/create-threed-job"

interface CreateThreeDJobWorkflowInput {
  session_id?: string
  user_id?: string
  username?: string
  ip_address: string
  uploaded_images?: any
  metadata?: any
}

export const createThreeDJobWorkflow = createWorkflow(
  "create-threed-job-workflow",
  (input: CreateThreeDJobWorkflowInput) => {
    const job = createThreeDJobStep(input)
    
    return new WorkflowResponse(job)
  }
)
