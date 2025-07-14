import { model } from "@medusajs/framework/utils"

const GalleryUpload = model.define("gallery_upload", {
  id: model.id().primaryKey(),
  image_url: model.text(),
  title: model.text().nullable(),
  description: model.text().nullable(),
  status: model.text().default("pending"), // "pending", "approved", "rejected"
  // created_at: model.dateTime().default(new Date()),
  // Optionally: user_id: model.text().nullable(),
})

export default GalleryUpload
