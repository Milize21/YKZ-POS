const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    // Store temporarily - videos will be converted to audio
    const mediaType = file.mimetype.startsWith('image/') ? 'images' : 
                      file.mimetype.startsWith('audio/') ? 'audio' : 'temp';
    const dir = path.join(uploadDir, mediaType);
    
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - accept both images and videos for upload
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|ogg|mov|avi|mp3/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (file.mimetype.startsWith('image/') && allowedImageTypes.test(ext)) {
    cb(null, true);
  } else if ((file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) && allowedVideoTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 600 * 1024 * 1024 // Default 600MB
  }
});

// Helper function to extract audio from video to MP3
const extractAudioToMP3 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .audioChannels(2)
      .audioFrequency(44100)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

// Upload single file (removed authenticateToken to allow uploads without login)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let finalFile = req.file;
    let shouldDeleteOriginal = false;

    // If it's a video, extract audio to MP3
    if (req.file.mimetype.startsWith('video/')) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const audioDir = path.join(uploadDir, 'audio');
      
      try {
        await fs.mkdir(audioDir, { recursive: true });
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const mp3Filename = uniqueSuffix + '.mp3';
        const mp3Path = path.join(audioDir, mp3Filename);
        
        // Extract audio from video
        await extractAudioToMP3(req.file.path, mp3Path);
        
        // Delete original video file
        await fs.unlink(req.file.path);
        
        // Update file info
        finalFile = {
          filename: mp3Filename,
          originalname: path.parse(req.file.originalname).name + '.mp3',
          mimetype: 'audio/mpeg',
          size: (await fs.stat(mp3Path)).size,
          path: mp3Path
        };
        
        const fileUrl = `/media/audio/${mp3Filename}`;
        
        return res.json({
          message: 'Video converted to MP3 successfully',
          file: {
            filename: finalFile.filename,
            originalName: finalFile.originalname,
            mimetype: finalFile.mimetype,
            size: finalFile.size,
            url: fileUrl,
            converted: true
          }
        });
      } catch (conversionError) {
        console.error('Audio conversion error:', conversionError);
        // If conversion fails, delete the original file
        try {
          await fs.unlink(req.file.path);
        } catch (e) {}
        return res.status(500).json({ error: 'Failed to convert video to audio' });
      }
    }

    // For images and already audio files
    const mediaType = finalFile.mimetype.startsWith('image/') ? 'images' : 
                      finalFile.mimetype.startsWith('audio/') ? 'audio' : 'videos';
    const fileUrl = `/media/${mediaType}/${finalFile.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: finalFile.filename,
        originalName: finalFile.originalname,
        mimetype: finalFile.mimetype,
        size: finalFile.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files
router.post('/upload-multiple', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/media/${file.mimetype.startsWith('image/') ? 'images' : 'videos'}/${file.filename}`
    }));
    
    res.json({
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Delete file
router.delete('/:type/:filename', authenticateToken, async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, type, filename);
    
    await fs.unlink(filePath);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file info
router.get('/:type/:filename', authenticateToken, async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, type, filename);
    
    const stats = await fs.stat(filePath);
    
    res.json({
      filename: filename,
      type: type,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      url: `/media/${type}/${filename}`
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    console.error('File info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// List files
router.get('/list/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const dirPath = path.join(uploadDir, type);
    
    try {
      const files = await fs.readdir(dirPath);
      const fileInfos = await Promise.all(
        files.map(async (file) => {
          const stats = await fs.stat(path.join(dirPath, file));
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            url: `/media/${type}/${file}`
          };
        })
      );
      
      res.json({ files: fileInfos });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json({ files: [] });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

module.exports = router;
