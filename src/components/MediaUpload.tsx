import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, FileImage, FileVideo } from 'lucide-react';

interface MediaUploadProps {
  onUploadComplete?: (url: string, type: 'image' | 'video', filename?: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  currentUrl?: string;
}

export default function MediaUpload({ 
  onUploadComplete, 
  accept = 'image/*,video/*',
  maxSize = 600,
  label = 'Upload Media',
  currentUrl
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Extract filename without extension
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

    // Determine media type
    const type = file.type.startsWith('image/') ? 'image' : 'video';
    setMediaType(type);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading to /api/media/upload');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        
        if (contentType && contentType.includes('application/json')) {
          const data = JSON.parse(errorText);
          throw new Error(data.error || 'Upload failed');
        } else {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Upload success:', data);
      
      if (onUploadComplete) {
        onUploadComplete(data.file.url, type, fileNameWithoutExt);
      }

      setError('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setMediaType(null);
    setError('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          Upload images or videos (max {maxSize}MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {preview ? (
          <div className="relative">
            {mediaType === 'image' ? (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <video 
                  src={preview} 
                  controls 
                  className="w-full h-48 rounded-md"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-2" />
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    Images or
                    <FileVideo className="h-4 w-4" />
                    Videos
                  </p>
                </>
              )}
            </div>
            <Input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        )}

        {uploading && (
          <div className="text-sm text-muted-foreground text-center">
            Uploading... Please wait
          </div>
        )}
      </CardContent>
    </Card>
  );
}
