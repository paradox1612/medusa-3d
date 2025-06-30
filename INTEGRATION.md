# 3D Model Generation Integration Guide

This guide will help you implement the 3D model generation feature in your Medusa e-commerce platform. Users can upload 4 images and generate 3D models using Synexa AI (Hunyuan3D-2 model).

## 🎯 Overview

This feature allows customers to:
- Upload 4 images from different angles
- Generate high-quality 3D models using AI
- Add products with 3D models to their cart
- View 3D models in the cart

## 📋 Prerequisites

- Medusa v2.x backend
- Next.js storefront
- Synexa AI API key (sign up at [Synexa AI](https://synexa.ai))
- Sharp library for image processing
- File storage configured (S3 or local)

## 🚀 Backend Implementation

### 1. Install Required Dependencies

```bash
cd backend
npm install sharp @types/multer
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Synexa AI Configuration
SYNEXA_API_KEY=your_synexa_api_key

# File Storage (S3 Example)
S3_FILE_URL=your_s3_url
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=your_region
S3_BUCKET=your_bucket_name
S3_ENDPOINT=your_s3_endpoint
```

### 3. Create Middleware Configuration

Create `backend/src/api/middlewares.ts`:

```typescript
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
      bodyParser: { sizeLimit: "50mb" }, // Increase body parser limit for 4 files
      middlewares: [
        // @ts-ignore - Medusa documentation shows this pattern
        upload.array("files", 4),
      ],
    },
  ],
})
```

### 4. Create 3D Model API Route

Create `backend/src/api/store/3d-model/route.ts`:

The API route handles file uploads, image compression, and 3D model generation using Synexa AI.

[Complete route implementation provided - see attached file backend/src/api/store/3d-model/route.ts]

## 🖥️ Frontend Implementation

### 1. Install Required Dependencies

```bash
cd storefront
npm install lucide-react
```

### 2. Create 3D Model Data Layer

Create `storefront/src/lib/data/3d-model.ts`:

```typescript
"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
} from "./cookies"

export async function generate3DModel(formData: FormData): Promise<ModelGenerationResponse> {
  const authHeaders = await getAuthHeaders()
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  
  // Use direct fetch instead of SDK to properly handle FormData
  const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/3d-model`, {
    method: "POST",
    body: formData,
    headers: {
      // Don't set Content-Type - let browser set multipart/form-data automatically
      ...(publishableKey && { "x-publishable-api-key": publishableKey }),
      ...authHeaders
    } as HeadersInit,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  const result = await response.json()
  
  // Revalidate cache
  const modelCacheTag = await getCacheTag("3d-models")
  revalidateTag(modelCacheTag)
  
  return result
}

export async function submitModelGeneration(
  currentState: unknown,
  formData: FormData
) {
  try {
    const files = formData.getAll('files') as File[]
    
    if (files.length !== 4) {
      return {
        success: false,
        error: "Please select exactly 4 images"
      }
    }

    const result = await generate3DModel(formData)
    return result
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to process 3D model generation"
    }
  }
}
```

### 3. Create 3D Upload Component

Create `storefront/src/modules/products/components/3d-model-upload/index.tsx`:

The upload component provides a 4-slot interface for image selection and handles the generation process.

[Complete component implementation provided - see attached file storefornt/src/modules/products/components/3d-model-upload/index.tsx]

### 4. Update Cart Integration

Update your cart functions to support 3D models in `storefront/src/lib/data/cart.ts`:

```typescript
export async function addToCartWith3D(data: {
  variantId: string
  quantity: number
  countryCode: string
  region: Region | null
  modelData?: {
    model_url: string
    prediction_id: string
    uploaded_images: string[]
    compression_stats: any[]
  }
}) {
  const cartId = getCartId()
  
  if (!cartId) {
    const region = data.region || (await getRegion(data.countryCode))
    if (!region) return "Region not found"

    const cart = await createCart({ region_id: region.id }).then((cart) => cart)
    
    const result = await addToCart({
      cartId: cart.id,
      items: [{
        variant_id: data.variantId,
        quantity: data.quantity,
        metadata: data.modelData ? {
          model_url: data.modelData.model_url,
          prediction_id: data.modelData.prediction_id,
          uploaded_images: JSON.stringify(data.modelData.uploaded_images),
          compression_stats: JSON.stringify(data.modelData.compression_stats),
          generated_at: new Date().toISOString(),
        } : undefined,
      }],
    })
    
    setCartId(cart.id)
    revalidateTag("cart")
    return result
  }

  await addToCart({
    cartId,
    items: [{
      variant_id: data.variantId,
      quantity: data.quantity,
      metadata: data.modelData ? {
        model_url: data.modelData.model_url,
        prediction_id: data.modelData.prediction_id,
        uploaded_images: JSON.stringify(data.modelData.uploaded_images),
        compression_stats: JSON.stringify(data.modelData.compression_stats),
        generated_at: new Date().toISOString(),
      } : undefined,
    }],
  })

  revalidateTag("cart")
}
```

### 5. Line Item Metadata Structure & Access Patterns

When a 3D model is added to the cart, the following metadata is stored with each line item:

#### Metadata Structure

```typescript
// Line item metadata structure
interface LineItemMetadata {
  model_url: string           // Direct URL to the .glb 3D model file
  prediction_id: string       // Synexa AI prediction ID for tracking
  uploaded_images: string     // JSON string of image URLs array
  compression_stats: string   // JSON string of compression details
  generated_at: string        // ISO timestamp of generation
}

// Example metadata object stored in cart line item
{
  model_url: "https://storage.url/models/generated_model_123.glb",
  prediction_id: "pred_abc123def456",
  uploaded_images: "[\"https://storage.url/img1.jpg\",\"https://storage.url/img2.jpg\",...]",
  compression_stats: "[{\"filename\":\"compressed_1_image.jpg\",\"original_size_mb\":\"2.15\",\"compressed_size_mb\":\"0.85\",\"compression_ratio\":\"60.5%\"}...]",
  generated_at: "2024-01-15T10:30:45.123Z"
}
```

#### Cart Item Component with 3D Model Display

Create or update your cart item component to display 3D model information:

```typescript
// src/modules/cart/components/item/index.tsx
"use client"

import { LineItem } from "@medusajs/client-types"
import { Button } from "@medusajs/ui"
import { Box, ExternalLink, Calendar, Image as ImageIcon } from "lucide-react"

interface CartItemProps {
  item: LineItem
  // ... other props
}

export default function CartItem({ item }: CartItemProps) {
  // Parse 3D model metadata if it exists
  const has3DModel = !!item.metadata?.model_url
  const modelUrl = item.metadata?.model_url as string
  const predictionId = item.metadata?.prediction_id as string
  const uploadedImages = item.metadata?.uploaded_images 
    ? JSON.parse(item.metadata.uploaded_images as string) as string[]
    : []
  const compressionStats = item.metadata?.compression_stats
    ? JSON.parse(item.metadata.compression_stats as string)
    : []
  const generatedAt = item.metadata?.generated_at as string

  return (
    <div className="cart-item border-b pb-4 mb-4">
      {/* Regular cart item content */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-medium">{item.variant?.product?.title}</h3>
          <p className="text-sm text-gray-600">{item.variant?.title}</p>
          <p className="font-semibold">${(item.unit_price / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* 3D Model Information */}
      {has3DModel && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Box className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              3D Model Included
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Model Preview Link */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <span className="font-medium">3D Model:</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(modelUrl, '_blank')}
                className="h-6 px-2 text-xs"
              >
                View 3D Model
              </Button>
            </div>

            {/* Generation Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">Generated:</span>
              </div>
              <span className="text-gray-600">
                {new Date(generatedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Images Count */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span className="font-medium">Source Images:</span>
              </div>
              <span className="text-gray-600">
                {uploadedImages.length} images
              </span>
            </div>

            {/* Prediction ID */}
            <div className="space-y-1">
              <span className="font-medium">ID:</span>
              <span className="text-gray-600 font-mono text-xs">
                {predictionId.slice(0, 12)}...
              </span>
            </div>
          </div>

          {/* Compression Stats (Expandable) */}
          <details className="mt-2">
            <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">
              View compression details
            </summary>
            <div className="mt-1 text-xs bg-white p-2 rounded border">
              {compressionStats.map((stat: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{stat.filename}:</span>
                  <span>{stat.original_size_mb}MB → {stat.compressed_size_mb}MB ({stat.compression_ratio})</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
```

#### Cart Summary with 3D Model Count

```typescript
// src/modules/cart/templates/summary/index.tsx
import { Cart } from "@medusajs/client-types"
import { Box } from "lucide-react"

interface CartSummaryProps {
  cart: Cart
}

export default function CartSummary({ cart }: CartSummaryProps) {
  // Count items with 3D models
  const items3D = cart.items?.filter(item => !!item.metadata?.model_url) || []
  const total3DModels = items3D.length

  return (
    <div className="cart-summary">
      {/* Regular cart summary content */}
      
      {/* 3D Models Summary */}
      {total3DModels > 0 && (
        <div className="flex items-center justify-between py-2 border-t">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-blue-600" />
            <span className="text-sm">3D Models</span>
          </div>
          <span className="text-sm font-medium">{total3DModels}</span>
        </div>
      )}
    </div>
  )
}
```

#### Checkout Integration

```typescript
// src/modules/checkout/templates/checkout-summary/index.tsx
import { Cart } from "@medusajs/client-types"

export default function CheckoutSummary({ cart }: { cart: Cart }) {
  const items3D = cart.items?.filter(item => !!item.metadata?.model_url) || []

  return (
    <div className="checkout-summary">
      {/* Regular checkout summary */}
      
      {/* 3D Models in Order */}
      {items3D.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            3D Models in Your Order ({items3D.length})
          </h4>
          <div className="space-y-2">
            {items3D.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span>{item.variant?.product?.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(item.metadata?.model_url as string, '_blank')}
                  className="h-6 px-2 text-xs"
                >
                  Preview 3D
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 3D model files will be available for download after order completion
          </p>
        </div>
      )}
    </div>
  )
}
```

#### Order History & Confirmation

```typescript
// src/modules/order/components/order-summary/index.tsx
import { Order } from "@medusajs/client-types"

export default function OrderSummary({ order }: { order: Order }) {
  const items3D = order.items?.filter(item => !!item.metadata?.model_url) || []

  return (
    <div className="order-summary">
      {/* Regular order summary */}
      
      {/* 3D Models Section */}
      {items3D.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
            <Box className="w-5 h-5" />
            Your 3D Models ({items3D.length})
          </h4>
          <div className="space-y-3">
            {items3D.map((item) => (
              <div key={item.id} className="border bg-white p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{item.variant?.product?.title}</h5>
                    <p className="text-sm text-gray-600">{item.variant?.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Generated: {new Date(item.metadata?.generated_at as string).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(item.metadata?.model_url as string, '_blank')}
                    >
                      View 3D
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = item.metadata?.model_url as string
                        link.download = `${item.variant?.product?.title}_3d_model.glb`
                        link.click()
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
                
                {/* Source Images Preview */}
                <div className="mt-2">
                  <details>
                    <summary className="text-xs cursor-pointer text-blue-600">
                      View source images ({JSON.parse(item.metadata?.uploaded_images as string).length})
                    </summary>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {JSON.parse(item.metadata?.uploaded_images as string).map((imgUrl: string, index: number) => (
                        <img
                          key={index}
                          src={imgUrl}
                          alt={`Source ${index + 1}`}
                          className="w-full aspect-square object-cover rounded border"
                        />
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

#### Backend Access to 3D Model Data

If you need to access 3D model data in your backend (for order processing, emails, etc.):

```typescript
// Example: Custom order processing API route
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { orderId } = req.params
  
  // Get order with line items
  const order = await req.scope.resolve("orderService").retrieve(orderId, {
    relations: ["items", "items.variant", "items.variant.product"]
  })
  
  // Extract 3D model data
  const threeDModelItems = order.items.filter(item => item.metadata?.model_url)
  
  const modelData = threeDModelItems.map(item => ({
    productTitle: item.variant.product.title,
    modelUrl: item.metadata.model_url,
    predictionId: item.metadata.prediction_id,
    uploadedImages: JSON.parse(item.metadata.uploaded_images),
    generatedAt: item.metadata.generated_at,
    compressionStats: JSON.parse(item.metadata.compression_stats)
  }))
  
  res.json({
    orderId,
    threeDModels: modelData
  })
}
```

### 6. Update Product Actions Component

Example integration in your product actions component:

```typescript
"use client"

import { useState } from "react"
import { Product, ProductVariant, Region } from "@medusajs/client-types"
import { Button } from "@medusajs/ui"
import { addToCartWith3D } from "@lib/data/cart"
import Image3DUpload from "../3d-model-upload"

export default function ProductActions({ product, region }: ProductActionsProps) {
  const [show3DUpload, setShow3DUpload] = useState(false)
  const [modelData, setModelData] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  )

  const handleAddToCart = async () => {
    if (!selectedVariant) return

    const result = await addToCartWith3D({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode: region.countries?.[0]?.iso_2 || "",
      region,
      modelData
    })

    if (typeof result === "string") {
      console.error("Failed to add to cart:", result)
    } else {
      console.log("Added to cart successfully")
      setModelData(null)
      setShow3DUpload(false)
    }
  }

  const handleModelGenerated = (data: any) => {
    setModelData(data)
    console.log("3D Model generated:", data)
  }

  return (
    <div className="space-y-4">
      {/* 3D Model Section */}
      <div className="border-t pt-4">
        {!show3DUpload && !modelData && (
          <Button
            variant="secondary"
            onClick={() => setShow3DUpload(true)}
            className="w-full"
          >
            Add 3D Model (Optional)
          </Button>
        )}

        {show3DUpload && !modelData && (
          <div>
            <Image3DUpload onModelGenerated={handleModelGenerated} />
            <Button
              variant="ghost"
              onClick={() => setShow3DUpload(false)}
              className="mt-2 w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {modelData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">3D Model Ready!</h4>
                <p className="text-sm text-green-600">
                  Generated from {modelData.uploaded_images?.length || 0} images
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(modelData.model_url, '_blank')}
                >
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModelData(null)
                    setShow3DUpload(true)
                  }}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={!selectedVariant}
        className="w-full"
      >
        {modelData ? "Add to cart with 3D Model" : "Add to cart"}
      </Button>
    </div>
  )
}
```

## 🔧 Configuration

### Environment Variables Required

**Backend (.env):**
```env
SYNEXA_API_KEY=your_synexa_api_key
# File storage configuration (S3, local, etc.)
S3_FILE_URL=your_s3_url
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=your_region
S3_BUCKET=your_bucket_name
S3_ENDPOINT=your_s3_endpoint
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key
MEDUSA_BACKEND_URL=http://localhost:9000
```

## 🧪 Testing

1. **Start Backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd storefront && npm run dev
   ```

3. **Test the Feature:**
   - Navigate to a product page
   - Click "Add 3D Model (Optional)"
   - Upload 4 images from different angles
   - Click "Send All Images & Generate 3D Model"
   - Wait for generation (usually 30-60 seconds)
   - Add to cart with 3D model

## 📋 File Structure Summary

```
backend/
├── src/
│   └── api/
│       ├── middlewares.ts              # Multer configuration
│       └── store/
│           └── 3d-model/
│               └── route.ts            # Main API endpoint

storefront/
├── src/
│   ├── lib/
│   │   └── data/
│   │       └── 3d-model.ts            # Data layer functions
│   └── modules/
│       └── products/
│           └── components/
│               └── 3d-model-upload/
│                   └── index.tsx       # Upload component
```

## 📝 Feature Specifications

- **Image Requirements:** 4 images, JPEG/PNG/WebP, max 10MB each
- **Processing Time:** 30-60 seconds typically
- **3D Model Format:** .glb file (widely supported)
- **AI Model:** Tencent Hunyuan3D-2 via Synexa AI
- **Storage:** Images and models stored in configured file storage
- **Cart Integration:** 3D metadata stored with line items

## 🔒 Security Considerations

- File type validation on both client and server
- File size limits enforced
- API key stored securely in environment variables
- Proper error handling for all failure cases
- Memory management for blob URLs

## 🚀 Production Deployment

1. Set up file storage (S3 recommended)
2. Configure environment variables
3. Ensure Synexa AI API key is valid
4. Test file upload limits with your hosting provider
5. Monitor API usage and costs

## 🆘 Troubleshooting

**Common Issues:**

1. **Files not uploading:** Check middleware configuration and file size limits
2. **API key errors:** Verify Synexa AI key in environment variables
3. **Content-type issues:** Ensure direct fetch is used instead of SDK for FormData
4. **Memory leaks:** Verify blob URL cleanup in useEffect
5. **CORS errors:** Check backend CORS configuration

**Debug Logs:**
Enable detailed logging by checking browser console for detailed flow information.

## 📝 Customization Options

- Adjust image compression settings in Sharp configuration
- Modify 3D generation parameters (steps, guidance_scale, etc.)
- Customize UI components and styling
- Add additional metadata fields
- Implement 3D model viewer in cart/checkout

## 🔄 Updates & Maintenance

- Monitor Synexa AI API for updates
- Keep Sharp and other dependencies updated
- Review file storage costs regularly
- Implement cleanup for old generated models if needed

---

This implementation provides a complete 3D model generation feature for Medusa e-commerce platforms. Follow the guide step by step for a smooth integration.

## 📚 Additional Resources

- [Medusa Documentation](https://docs.medusajs.com/)
- [Synexa AI API Documentation](https://synexa.ai/docs)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Next.js File Upload Best Practices](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#non-ui-responses)

## 🤝 Support

If you encounter issues during integration, consider:
1. Checking the browser console for detailed error logs
2. Reviewing the backend logs for API errors
3. Verifying all environment variables are set correctly
4. Testing with different image formats and sizes
5. Ensuring file storage permissions are configured properly 