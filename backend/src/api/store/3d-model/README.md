# 3D Model Generation API

This API accepts 4 photos from the frontend, compresses them using Sharp, uploads them to storage, and generates a 3D model using Synexa AI.

## Endpoint

```
POST /store/3d-model
```

## Setup

1. Set the environment variable:
```bash
SYNEXA_API_KEY=your_synexa_api_key_here
```

2. Install dependencies (already done):
```bash
npm install sharp multer @types/multer
```

## Usage

### Request

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Required**: Exactly 4 image files
- **Optional Fields**:
  - `caption`: Text description of the object
  - `steps`: Generation quality steps (5-50, default: 20)
  - `guidance_scale`: AI guidance strength (1.0-10.0, default: 7.5)
  - `octree_resolution`: Model resolution ("128", "256", "512", default: "256")

### Frontend Example (JavaScript)

```javascript
const formData = new FormData();

// Add 4 image files
formData.append('files', imageFile1);
formData.append('files', imageFile2);
formData.append('files', imageFile3);
formData.append('files', imageFile4);

// Optional parameters
formData.append('caption', 'realistic painted human figure');
formData.append('steps', '20');
formData.append('guidance_scale', '7.5');
formData.append('octree_resolution', '256');

const response = await fetch('/store/3d-model', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

### Response

```json
{
  "success": true,
  "message": "3D model generated successfully",
  "data": {
    "prediction_id": "7ab64193-35c3-44d4-95d8-df2f8aaa2bdb",
    "status": "succeeded",
    "model_url": "https://files.synexa.ai/output/2025-06-29/model.glb",
    "uploaded_images": [
      {
        "url": "https://your-storage.com/compressed_1_image1.jpg",
        "filename": "compressed_1_image1.jpg"
      }
    ],
    "compression_stats": [
      {
        "filename": "compressed_1_image1.jpg",
        "original_size_mb": "5.2",
        "compressed_size_mb": "2.8",
        "compression_ratio": "46.2%"
      }
    ],
    "processing_time": 4.185,
    "created_at": "2025-06-29T17:45:32.082000+00:00",
    "completed_at": "2025-06-29T17:45:37.359000+00:00"
  }
}
```

## Features

- ✅ **Automatic Image Compression**: Uses Sharp to ensure each image is under 3MB
- ✅ **File Upload**: Images are uploaded to your configured file storage
- ✅ **Single API Call**: Complete processing from upload to final 3D model
- ✅ **Format Support**: JPEG, PNG, WebP (converted to JPEG for optimization)
- ✅ **Progress Monitoring**: Automatic polling until completion
- ✅ **Detailed Stats**: Compression statistics included in response

## Processing Flow

1. **Validate**: Ensures exactly 4 images are provided
2. **Compress**: Each image is resized to max 1024x1024 and compressed to <3MB
3. **Upload**: Compressed images are uploaded to your file storage
4. **Generate**: Calls Synexa AI with the uploaded image URLs
5. **Poll**: Monitors generation progress every 5 seconds
6. **Return**: Complete 3D model URL when finished

## Error Handling

The API handles various error scenarios:

- Missing or incorrect number of images
- Image compression failures
- File upload failures
- Synexa AI API errors
- Generation timeouts (5 minute maximum)

## Notes

- Processing typically takes 30 seconds to 5 minutes
- The first image is used as the main image, others as multiple views
- Images are automatically processed for background removal
- The generated .glb file URL should be downloaded and stored locally as it may expire 