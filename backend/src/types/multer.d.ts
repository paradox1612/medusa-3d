// Create this file at: src/types/multer.d.ts

import { MedusaRequest } from "@medusajs/framework/http"

declare global {
    namespace Express {
      namespace Multer {
        interface File {
          fieldname: string
          originalname: string
          encoding: string
          mimetype: string
          buffer: Buffer
          size: number
        }
      }
    }
  }
  
  declare module "@medusajs/framework/http" {
    interface MedusaRequest {
      file?: Express.Multer.File
      files?: Express.Multer.File[]
    }
  }
  
  export {}