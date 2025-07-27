# 3D Jobs API

This API handles the creation and management of 3D model generation jobs. It processes uploaded images, generates 3D models using Synexa AI, and provides endpoints for tracking job status and retrieving results.

## Table of Contents
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Request/Response Formats](#requestresponse-formats)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [Setup](#setup)
- [Rate Limiting](#rate-limiting)
- [Troubleshooting](#troubleshooting)

## API Endpoints

### Create a New 3D Job
```
POST /store/threed-jobs
```
Create a new 3D model generation job by uploading 4 images of an object from different angles.

### List All Jobs
```
GET /store/threed-jobs
```
Retrieve a list of all 3D jobs, with optional filtering by status, user_id, or session_id.

### Get Job Status
```
GET /store/threed-jobs/:id
```
Get the current status and details of a specific 3D job.

### Update Job
```
POST /store/threed-jobs/:id
```
Update a specific 3D job (admin only).

## Request/Response Formats

### Create Job Request
```http
POST /store/threed-jobs
Content-Type: multipart/form-data

files=[4 image files]
caption=string (optional)
steps=number (optional, default: 20)
guidance_scale=number (optional, default: 7.5)
octree_resolution=string (optional, default: "256")
user_id=string (optional)
session_id=string (optional)
username=string (optional)
```

### Create Job Response (202 Accepted)
```json
{
  "success": true,
  "message": "3D model generation job started",
  "job_id": "job_abc123",
  "status": "pending",
  "estimated_completion_time": "2-5 minutes",
  "polling_endpoint": "/store/threed-jobs/job_abc123"
}
```

### Get Job Status Response
```json
{
  "success": true,
  "job": {
    "id": "job_abc123",
    "status": "completed",
    "prediction_id": "synexa_pred_123",
    "model_url": "https://storage.example.com/models/3d_model_123.glb",
    "original_model_url": "https://synexa.ai/models/3d_model_123.glb",
    "uploaded_images": [
      {
        "url": "https://storage.example.com/images/img1.jpg",
        "filename": "compressed_1_image1.jpg",
        "size_mb": "1.23"
      }
    ],
    "compression_stats": [
      {
        "filename": "compressed_1_image1.jpg",
        "original_size_mb": "2.45",
        "compressed_size_mb": "1.23",
        "compression_ratio": "49.8%"
      }
    ],
    "processing_time": 45000,
    "error_message": null,
    "created_at": "2025-07-26T15:30:00.000Z",
    "updated_at": "2025-07-26T15:30:45.000Z",
    "metadata": {
      "request_params": {
        "caption": "A 3D model of a chair",
        "steps": 20,
        "guidance_scale": 7.5,
        "octree_resolution": "256"
      },
      "is_uploaded_to_storage": true,
      "synexa_processing_time": 35.2,
      "upload_info": {
        "attempted_upload": true,
        "upload_successful": true,
        "fallback_used": false,
        "storage_url": "https://storage.example.com/models/3d_model_123.glb",
        "external_url": "https://synexa.ai/models/3d_model_123.glb"
      }
    }
  }
}
```

## Examples

### Creating a New 3D Job (JavaScript)
```javascript
// Using FormData API in browser
const formData = new FormData();

// Add 4 image files
formData.append('files', imageFile1);
formData.append('files', imageFile2);
formData.append('files', imageFile3);
formData.append('files', imageFile4);

// Add optional parameters
formData.append('caption', 'A 3D model of a chair');
formData.append('steps', '20');
formData.append('guidance_scale', '7.5');
formData.append('octree_resolution', '256');
formData.append('user_id', 'user_123');
formData.append('session_id', 'session_abc');
formData.append('username', 'johndoe');

// Make the request
const response = await fetch('/store/threed-jobs', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Job created:', result);
```

### Polling for Job Completion (JavaScript)
```javascript
async function pollJobStatus(jobId) {
  const maxAttempts = 30; // 5 minutes with 10-second intervals
  let attempts = 0;

  const checkStatus = async () => {
    try {
      const response = await fetch(`/store/threed-jobs/${jobId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to check job status');
      }

      const { status } = data.job;
      
      if (status === 'completed') {
        console.log('Job completed successfully!', data.job);
        return data.job;
      } else if (status === 'failed') {
        throw new Error(data.job.error_message || 'Job failed');
      } else if (attempts >= maxAttempts) {
        throw new Error('Job timed out');
      } else {
        // Poll again after a delay
        attempts++;
        console.log(`Job status: ${status} (attempt ${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
        return checkStatus();
      }
    } catch (error) {
      console.error('Error polling job status:', error);
      throw error;
    }
  };

  return checkStatus();
}

// Usage
pollJobStatus('job_abc123')
  .then(job => console.log('3D model URL:', job.model_url))
  .catch(console.error);
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "type": "INVALID_DATA" | "NOT_FOUND" | "INTERNAL_ERROR",
  "details": "Additional error details"
}
```

### Common Error Types
- `INVALID_DATA`: Invalid request parameters or missing required fields
- `NOT_FOUND`: The requested resource was not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

## Setup

### Prerequisites
- Node.js 16+
- Medusa.js backend
- Synexa AI API key

### Environment Variables
```env
SYNEXA_API_KEY=your_synexa_api_key_here
```

### Dependencies
```bash
npm install sharp multer @types/multer
```

## Rate Limiting
- 60 requests per minute per IP address
- File size limit: 10MB per file
- Maximum 4 files per request

## Troubleshooting

### Common Issues
1. **Job Stuck in Processing**
   - Check the Synexa AI service status
   - Verify the Synexa API key is valid
   - Check server logs for errors

2. **File Upload Fails**
   - Ensure files are under 10MB each
   - Verify the file types are supported (JPEG, PNG)
   - Check server storage configuration

3. **Authentication Issues**
   - Verify API keys and tokens
   - Check CORS configuration if accessing from a different domain

### Getting Help
For additional support, please contact the development team or open an issue in the repository.
