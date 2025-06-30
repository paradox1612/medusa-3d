import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.json({
    message: "Custom store API is working!",
    endpoint: {
      "3d_model_generation": "POST /store/3d-model"
    },
    description: "Upload 4 images and generate a 3D model (complete processing in one call)",
    usage: {
      "method": "POST",
      "endpoint": "/store/3d-model",
      "content_type": "multipart/form-data",
      "required_files": "4 images (any format, will be compressed to <3MB each)",
      "optional_fields": {
        "caption": "Text description of the object",
        "steps": "Generation quality steps (5-50, default: 20)",
        "guidance_scale": "AI guidance strength (1.0-10.0, default: 7.5)",
        "octree_resolution": "Model resolution (128/256/512, default: 256)"
      },
      "response": "Complete 3D model (.glb file URL) after processing is finished"
    },
    features: [
      "✅ Automatic image compression using Sharp (ensures <3MB per image)",
      "✅ Upload to your file storage",
      "✅ Complete 3D model generation in one call",
      "✅ Processing status monitoring with automatic polling",
      "✅ Detailed compression statistics in response",
      "✅ Support for JPEG, PNG, WebP (converted to JPEG)",
      "✅ Typical processing time: 30 seconds to 5 minutes"
    ],
    setup: {
      "required": "Set SYNEXA_API_KEY environment variable",
      "dependencies": "sharp, multer (auto-installed)"
    }
  });
}
