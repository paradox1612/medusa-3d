import { model } from "@medusajs/framework/utils"

export const ThreeDJob = model.define("threed_job", {
  id: model.id().primaryKey(),
  session_id: model.text().nullable(),
  user_id: model.text().nullable(),
  username: model.text().nullable(),
  ip_address: model.text(),
  status: model.enum(["pending", "processing", "completed", "failed"]).default("pending"),
  prediction_id: model.text().nullable(),
  model_url: model.text().nullable(),
  original_model_url: model.text().nullable(),
  uploaded_images: model.json().nullable(),
  compression_stats: model.json().nullable(),
  processing_time: model.number().nullable(),
  error_message: model.text().nullable(),
  synexa_data: model.json().nullable(),
  metadata: model.json().nullable(),
  //created_at: model.dateTime().defaultNow(),
})

export default ThreeDJob
