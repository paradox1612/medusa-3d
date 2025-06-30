# Custom Store API - 3D Model Generation

This API provides endpoints to generate 3D models from images using the Synexa AI service.

## Setup

1. Add your Synexa API key to your environment variables:
```bash
SYNEXA_API_KEY=your_api_key_here
```

2. Make sure your Medusa backend is running.

## Endpoints

### 1. Submit 3D Model Generation Request

**Endpoint:** `POST /store/custom/3d-model`

**Description:** Submit a request to generate a 3D model from an image.

**Request Body:**
```json
{
  "image": "https://example.com/image.png",
  "multiple_views": [
    "https://example.com/side.png",
    "https://example.com/top.png",
    null
  ],
  "caption": "realistic painted human figure",
  "seed": 1234,
  "steps": 20,
  "shape_only": false,
  "guidance_scale": 7.5,
  "check_box_rembg": true,
  "octree_resolution": "256"
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image` | string | Yes | - | URL of the main image to convert to 3D |
| `multiple_views` | array | No | [] | Array of additional image URLs (max 3), use `null` for empty slots |
| `caption` | string | No | "" | Text description of the object |
| `seed` | integer | No | 1234 | Random seed for reproducible results |
| `steps` | integer | No | 20 | Generation quality steps (5-50) |
| `shape_only` | boolean | No | false | Generate shape only without textures |
| `guidance_scale` | float | No | 7.5 | AI guidance strength (1.0-10.0) |
| `check_box_rembg` | boolean | No | true | Remove background from images |
| `octree_resolution` | string | No | "256" | Model resolution: "128", "256", or "512" |

**Success Response (202 Accepted):**
```json
{
  "id": "7ab64193-35c3-44d4-95d8-df2f8aaa2bdb",
  "model": "tencent/hunyuan3d-2",
  "version": null,
  "input": {
    "seed": 1234,
    "image": "https://example.com/image.png",
    "steps": 20,
    "caption": "realistic painted human figure",
    "shape_only": false,
    "guidance_scale": 7.5,
    "multiple_views": [],
    "check_box_rembg": true,
    "octree_resolution": "256"
  },
  "logs": null,
  "output": null,
  "error": null,
  "status": "starting",
  "created_at": "2025-06-29T17:45:32.082000+00:00",
  "started_at": null,
  "completed_at": null,
  "metrics": null
}
```

### 2. Get Prediction Status

**Endpoint:** `GET /store/custom/3d-model/{predictionId}`

**Description:** Get the status and results of a 3D model generation request.

### 3. Complete 3D Model Generation

**Endpoint:** `POST /store/custom/3d-model/complete`

**Description:** Submit a request and wait for the 3D model generation to complete. This endpoint handles the entire process from submission to completion and returns the final 3D model URL.

**Request Body:**
```json
{
  "image": "https://example.com/image.png",
  "multiple_views": [
    "https://example.com/side.png",
    "https://example.com/top.png",
    null
  ],
  "caption": "realistic painted human figure",
  "seed": 1234,
  "steps": 20,
  "shape_only": false,
  "guidance_scale": 7.5,
  "check_box_rembg": true,
  "octree_resolution": "256",
  "timeout": 300000
}
```

**Additional Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `timeout` | integer | No | 300000 | Maximum wait time in milliseconds (30s-10min) |

**Success Response (200 OK):**
```json
{
  "success": true,
  "prediction_id": "7ab64193-35c3-44d4-95d8-df2f8aaa2bdb",
  "status": "succeeded",
  "model_url": "https://files.synexa.ai/output/2025-06-29/7ab64193-35c3-44d4-95d8-df2f8aaa2bdb_white_mesh.glb",
  "processing_time": 4.185,
  "created_at": "2025-06-29T17:45:32.082000+00:00",
  "completed_at": "2025-06-29T17:45:37.359000+00:00",
  "input_parameters": {
    "seed": 1234,
    "image": "https://example.com/image.png",
    "steps": 20,
    "caption": "realistic painted human figure",
    "shape_only": false,
    "guidance_scale": 7.5,
    "multiple_views": [],
    "check_box_rembg": true,
    "octree_resolution": "256"
  },
  "message": "3D model generated successfully"
}
```

**Error Response (408 Request Timeout):**
```json
{
  "error": "Request timeout",
  "details": "3D model generation took too long to complete"
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "Generation failed",
  "details": "3D model generation failed: Invalid image format"
}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `predictionId` | string | Yes | The ID returned from the prediction submission |

**Response - Starting:**
```json
{
  "id": "7ab64193-35c3-44d4-95d8-df2f8aaa2bdb",
  "status": "starting",
  ...
}
```

**Response - Processing:**
```json
{
  "id": "7ab64193-35c3-44d4-95d8-df2f8aaa2bdb",
  "status": "processing",
  "logs": "Processing step 15/20...",
  ...
}
```

**Response - Succeeded:**
```json
{
  "id": "7ab64193-35c3-44d4-95d8-df2f8aaa2bdb",
  "status": "succeeded",
  "output": [
    "https://files.synexa.ai/output/2025-06-29/7ab64193-35c3-44d4-95d8-df2f8aaa2bdb_white_mesh.glb"
  ],
  "metrics": {
    "predict_time": 4.185
  },
  ...
}
```

**Response - Failed:**
```json
{
  "id": "7ab64193-35c3-44d4-95d8-df2f8aaa2bdb",
  "status": "failed",
  "error": "Failed to process image: Invalid image format",
  ...
}
```

## Status Flow

The prediction follows this status progression:

1. **starting** - Request received and queued
2. **processing** - AI model is generating the 3D model
3. **succeeded** - Generation completed successfully, `.glb` file available in `output` array
4. **failed** - Generation failed, error details in `error` field

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required field: image",
  "details": "The 'image' field is required and must be a valid URL"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid API key"
}
```

### 404 Not Found
```json
{
  "detail": "Prediction not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Failed to submit 3D model generation request"
}
```

## Example Usage

### Using curl

1. Submit a 3D model generation request:
```bash
curl -X POST http://localhost:9000/store/custom/3d-model \
  -H "Content-Type: application/json" \
  -d '{
    "image": "https://example.com/image.png",
    "caption": "a realistic human figure",
    "steps": 25
  }'
```

2. Check the status:
```bash
curl http://localhost:9000/store/custom/3d-model/7ab64193-35c3-44d4-95d8-df2f8aaa2bdb
```

### Using JavaScript

**Option 1: Complete endpoint (recommended)**
```javascript
// Submit and wait for completion in one request
const response = await fetch('/store/custom/3d-model/complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: 'https://example.com/image.png',
    caption: 'a realistic human figure',
    steps: 25,
    timeout: 300000 // 5 minutes
  })
});

const result = await response.json();

if (result.success) {
  console.log('3D model ready:', result.model_url);
  console.log('Processing time:', result.processing_time, 'seconds');
} else {
  console.error('Generation failed:', result.error);
}
```

**Option 2: Manual polling**
```javascript
// Submit request
const response = await fetch('/store/custom/3d-model', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: 'https://example.com/image.png',
    caption: 'a realistic human figure',
    steps: 25
  })
});

const prediction = await response.json();
const predictionId = prediction.id;

// Poll for status
const checkStatus = async () => {
  const statusResponse = await fetch(`/store/custom/3d-model/${predictionId}`);
  const status = await statusResponse.json();
  
  if (status.status === 'succeeded') {
    console.log('3D model ready:', status.output[0]);
  } else if (status.status === 'failed') {
    console.error('Generation failed:', status.error);
  } else {
    // Still processing, check again later
    setTimeout(checkStatus, 5000);
  }
};

checkStatus();
```

## Notes

- The API requires a valid Synexa API key set in the `SYNEXA_API_KEY` environment variable.
- Image URLs must be publicly accessible.
- The generated 3D models are returned as `.glb` files.
- Processing times vary depending on the complexity and resolution settings.
- Rate limits are enforced by the Synexa API service. 