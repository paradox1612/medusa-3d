# Kush Bro - E-commerce with 3D Model Generation

This project is a Medusa-based e-commerce platform with integrated 3D model generation capabilities using Synexa AI.

## 🚀 Features

### 3D Model Generation
- **Upload 4 images** of any product from different angles
- **Automatic compression** using Sharp (ensures <3MB per image) 
- **AI-powered 3D model generation** using Synexa AI (Hunyuan3D-2 model)
- **Seamless cart integration** with 3D model metadata
- **Real-time progress tracking** during generation
- **3D model preview** and download capabilities

## 🛠️ Setup

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set environment variables:**
Create a `.env` file in the backend directory:
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/medusa-store

# 3D Model Generation - Synexa AI
SYNEXA_API_KEY=your_synexa_api_key_here

# Other configurations...
```

3. **Start the backend:**
```bash
npm run dev
```

### Storefront Setup

1. **Install dependencies:**
```bash
cd storefornt
npm install
```

2. **Start the storefront:**
```bash
npm run dev
```

## 🎮 Usage

### For Customers

1. **Browse products** on the storefront
2. **Select a product** you want to customize with a 3D model
3. **Click "Add 3D Model (Optional)"** on the product page
4. **Upload 4 images** of the product from different angles:
   - Main front view
   - Side view  
   - Top/back view
   - Additional angle
5. **Wait for processing** (30 seconds to 5 minutes)
6. **Preview the generated 3D model**
7. **Add to cart** with the 3D model included

### Features in Cart

- **3D Model indicators** show which items have custom 3D models
- **View 3D Model** links for instant preview
- **Generation timestamps** for tracking
- **Metadata preservation** through checkout process

## 🔧 API Endpoints

### 3D Model Generation
```
POST /store/3d-model
```

**Request:**
- Content-Type: `multipart/form-data`
- Files: Exactly 4 images (JPEG/PNG/WebP)
- Optional fields: `caption`, `steps`, `guidance_scale`, `octree_resolution`

**Response:**
```json
{
  "success": true,
  "data": {
    "model_url": "https://files.synexa.ai/output/model.glb",
    "prediction_id": "uuid",
    "uploaded_images": ["url1", "url2", "url3", "url4"],
    "compression_stats": [...],
    "processing_time": 4.2
  }
}
```

### API Information
```
GET /store/custom
```
Returns comprehensive API documentation and usage examples.

## 🔍 Technical Details

### Image Processing
- **Sharp-based compression** ensures optimal file sizes
- **Automatic format conversion** to JPEG for compatibility
- **Intelligent resizing** (max 1024x1024) while preserving aspect ratio
- **Progressive JPEG** encoding for faster loading

### 3D Generation Pipeline
1. **Upload & Compress** - Images processed and uploaded to storage
2. **AI Processing** - Synexa AI generates 3D model using Hunyuan3D-2
3. **Polling** - Real-time status monitoring every 5 seconds
4. **Completion** - Final .glb file URL returned

### Cart Integration
- **Metadata storage** in line item metadata
- **Persistent data** through checkout process
- **Visual indicators** in cart and checkout
- **Direct 3D preview** from cart items

## 📋 Requirements

### Dependencies
- **Backend:** Sharp, Multer, @types/multer
- **Frontend:** Lucide React (for icons)
- **External:** Synexa AI API access

### System Requirements
- Node.js >= 18
- PostgreSQL database
- Medusa v2 framework
- Next.js 15+ for storefront

## 🎨 UI Components

### 3D Upload Component
- **Drag & drop interface** for file selection
- **Image preview grid** with placeholder slots
- **Real-time progress** and error handling
- **Compression statistics** display

### Cart Integration
- **3D model badges** on cart items
- **Preview buttons** for instant 3D viewing
- **Generation metadata** display

### Product Page
- **Optional 3D addition** without disrupting normal flow
- **Loading states** during generation
- **Success confirmation** with preview options

## 🔐 Security

- **File type validation** (JPEG/PNG/WebP only)
- **Size limits** (10MB per image, compressed to <3MB)
- **API key protection** via environment variables
- **Input sanitization** for all form data

## 📈 Performance

- **Parallel image processing** for faster compression
- **Optimized polling** with exponential backoff
- **Caching strategies** for uploaded images
- **Progressive loading** for large 3D models

## 🚀 Production Deployment

1. **Set production environment variables**
2. **Configure file storage** (AWS S3, etc.)
3. **Set up Synexa AI API key**
4. **Deploy backend and frontend**
5. **Configure reverse proxy** for API calls

## 📞 Support

For issues with:
- **3D generation**: Check Synexa AI API status and quotas
- **File uploads**: Verify storage configuration
- **Cart metadata**: Ensure line item metadata is enabled

---

## 🎭 3D Model Features Summary

✅ **Single API endpoint** handles everything from upload to final 3D model  
✅ **Automatic image compression** ensures optimal performance  
✅ **Real-time progress tracking** keeps users informed  
✅ **Seamless cart integration** with metadata preservation  
✅ **Visual indicators** throughout the shopping experience  
✅ **Direct 3D preview** capabilities  
✅ **Mobile-responsive** design  
✅ **Error handling** and user feedback  

Perfect for e-commerce platforms wanting to offer personalized 3D product experiences! 