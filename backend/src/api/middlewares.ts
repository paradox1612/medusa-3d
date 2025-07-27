import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 4 // Max 4 files
  }
})

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/store/3d-model",
      bodyParser: { sizeLimit: "50mb" },
      middlewares: [
        // @ts-ignore - Medusa documentation shows this pattern
        upload.array("files", 4),
      ],
    },
    // Add this new route for threed-jobs
    {
      method: ["POST"],
      matcher: "/threed-jobs",
      bodyParser: { sizeLimit: "50mb" },
      middlewares: [
        // @ts-ignore - Medusa documentation shows this pattern
        upload.array("files", 4),
      ],
    },
  ],
})