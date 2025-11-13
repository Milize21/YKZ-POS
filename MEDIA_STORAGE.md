# Media Storage System

## Overview
The YKZ-POS system now includes a separate storage volume for images and videos, managed through dedicated API endpoints.

## Storage Architecture

### Docker Volumes
- **postgres_data**: Database storage (48.52MB used)
- **media_storage**: Images and videos storage (mounted at `/app/uploads` in backend)

### Storage Structure
```
/app/uploads/
├── images/     (Product images, JPG, PNG, GIF, WebP)
└── videos/     (Product videos, MP4, WebM, OGG, MOV, AVI)
```

### Capacity
- Total available: 950GB
- Current usage: ~48MB (database only, media storage is new)
- Max file size: 100MB per file (configurable via MAX_FILE_SIZE env var)

## API Endpoints

### Upload Single File
**POST** `/api/media/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
file: <binary file>
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "filename": "1735123456789-123456789.jpg",
    "originalName": "product.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000,
    "url": "/media/images/1735123456789-123456789.jpg"
  }
}
```

### Upload Multiple Files
**POST** `/api/media/upload-multiple`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
files[]: <binary files> (max 10 files)
```

**Response:**
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "filename": "1735123456789-123456789.jpg",
      "originalName": "product1.jpg",
      "mimetype": "image/jpeg",
      "size": 1024000,
      "url": "/media/images/1735123456789-123456789.jpg"
    }
  ]
}
```

### Delete File
**DELETE** `/api/media/:type/:filename`

**Parameters:**
- `type`: "images" or "videos"
- `filename`: The file name to delete

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

### Get File Info
**GET** `/api/media/:type/:filename`

**Parameters:**
- `type`: "images" or "videos"
- `filename`: The file name

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "filename": "1735123456789-123456789.jpg",
  "type": "images",
  "size": 1024000,
  "created": "2025-01-20T10:30:00.000Z",
  "modified": "2025-01-20T10:30:00.000Z",
  "url": "/media/images/1735123456789-123456789.jpg"
}
```

### List Files
**GET** `/api/media/list/:type`

**Parameters:**
- `type`: "images" or "videos"

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "files": [
    {
      "filename": "1735123456789-123456789.jpg",
      "size": 1024000,
      "created": "2025-01-20T10:30:00.000Z",
      "url": "/media/images/1735123456789-123456789.jpg"
    }
  ]
}
```

## Database Schema

The `products` table includes these media columns:

```sql
CREATE TABLE products (
    ...
    image_url VARCHAR(500),    -- Stores image URL from media API
    video_url VARCHAR(500),    -- Stores video URL from media API
    ...
);
```

## Frontend Integration

### Using the MediaUpload Component

```tsx
import MediaUpload from '@/components/MediaUpload';

function ProductForm() {
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  return (
    <div>
      {/* Upload product image */}
      <MediaUpload
        label="Product Image"
        accept="image/*"
        maxSize={10}
        onUploadComplete={(url) => setImageUrl(url)}
      />

      {/* Upload product video */}
      <MediaUpload
        label="Product Video"
        accept="video/*"
        maxSize={100}
        onUploadComplete={(url) => setVideoUrl(url)}
      />
    </div>
  );
}
```

### Direct API Usage

```typescript
// Upload file
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3001/api/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  return data.file.url;
};

// Delete file
const deleteFile = async (type: 'images' | 'videos', filename: string) => {
  const token = localStorage.getItem('token');
  await fetch(`http://localhost:3001/api/media/${type}/${filename}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

## Accessing Media Files

Media files are served statically from the backend:

**URL Format:**
```
http://localhost:3001/media/{type}/{filename}
```

**Examples:**
```
http://localhost:3001/media/images/1735123456789-123456789.jpg
http://localhost:3001/media/videos/1735123456789-987654321.mp4
```

## Configuration

### Environment Variables (Backend)

```env
UPLOAD_DIR=/app/uploads           # Upload directory path
MAX_FILE_SIZE=104857600           # Max file size in bytes (100MB)
```

### Allowed File Types

**Images:**
- JPEG/JPG
- PNG
- GIF
- WebP

**Videos:**
- MP4
- WebM
- OGG
- MOV
- AVI

## Docker Commands

### View storage usage
```bash
docker volume inspect ykz-pos_media_storage
docker exec ykz-pos-backend du -sh /app/uploads
```

### Backup media files
```bash
docker run --rm -v ykz-pos_media_storage:/data -v ${PWD}:/backup alpine tar czf /backup/media-backup.tar.gz /data
```

### Restore media files
```bash
docker run --rm -v ykz-pos_media_storage:/data -v ${PWD}:/backup alpine tar xzf /backup/media-backup.tar.gz -C /
```

### Clean up unused media
```bash
docker exec ykz-pos-backend sh -c "find /app/uploads -type f -mtime +30 -delete"
```

## Security Considerations

1. **Authentication Required**: All media endpoints require JWT authentication
2. **File Type Validation**: Only allowed file types can be uploaded
3. **File Size Limits**: Maximum 100MB per file (configurable)
4. **Unique Filenames**: Prevents filename collisions using timestamp + random suffix
5. **Separate Storage**: Media storage is isolated from database storage

## Monitoring

Check media storage usage:
```bash
# Total size
docker exec ykz-pos-backend du -sh /app/uploads

# Images size
docker exec ykz-pos-backend du -sh /app/uploads/images

# Videos size
docker exec ykz-pos-backend du -sh /app/uploads/videos

# Number of files
docker exec ykz-pos-backend sh -c "find /app/uploads -type f | wc -l"
```

## Troubleshooting

### Upload fails with "No file uploaded"
- Check that the form field name is "file" (singular)
- For multiple uploads, use "files[]" (plural with brackets)

### 413 Payload Too Large
- File exceeds MAX_FILE_SIZE limit
- Increase the limit in docker-compose.yml and rebuild

### File not accessible after upload
- Ensure the backend container has proper permissions
- Check that the media_storage volume is mounted correctly

### Cannot delete file
- Verify the file exists: `docker exec ykz-pos-backend ls -la /app/uploads/images`
- Check user permissions in the container

## Future Enhancements

- Image resizing/optimization on upload
- Thumbnail generation for videos
- CDN integration for production
- Automated cleanup of orphaned files
- Image compression
- Video transcoding
- Metadata extraction (dimensions, duration, etc.)
