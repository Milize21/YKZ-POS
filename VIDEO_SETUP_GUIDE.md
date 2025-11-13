# Video Player Setup Guide

## Adding Music Videos to Your YKZ-POS System

### Quick Start

1. **Access Video Management**
   - Login as admin (username: `admin`, password: `12345`)
   - Navigate to **Videos** in the sidebar
   - The video player will appear on the Sales page

2. **Upload Videos**
   - Click "Add Video" button
   - Enter video title (e.g., "Summer Vibes - Artist Name")
   - Upload video file (max 100MB) or paste URL
   - Click "Add Video"
   - Repeat for 3-15 videos

3. **Video Requirements**
   - **Formats**: MP4, WebM, OGG, MOV, AVI
   - **Size**: Maximum 100MB per video
   - **Quantity**: 3-15 videos recommended
   - **Audio**: Included in video file

### Features

✅ **Automatic Looping**: Videos play continuously from start to finish, then repeat
✅ **Start Position**: Choose which video plays first
✅ **Playlist Management**: Reorder videos by dragging
✅ **Volume Control**: Adjust audio from 0-100%
✅ **Play/Pause Controls**: Manual playback control
✅ **Next/Previous**: Skip between videos
✅ **Full Playlist View**: See all videos in queue

### Video Player Layout

The video player appears on the **Sales** page in a dedicated column:

```
┌─────────────────────────────────────────────────────────┐
│                     Sales Page                          │
├─────────────────┬──────────────────┬────────────────────┤
│   Products      │   Video Player   │   Shopping Cart    │
│   (3 columns)   │   (1 column)     │   (1 column)       │
│                 │                  │                    │
│  • Product 1    │  ┌────────────┐  │  Cart Items:       │
│  • Product 2    │  │   Video    │  │  • Item 1          │
│  • Product 3    │  │  Playing   │  │  • Item 2          │
│  • Product 4    │  │            │  │                    │
│                 │  └────────────┘  │  Total: Rp X       │
│                 │  [Play] [Next]   │  [Checkout]        │
└─────────────────┴──────────────────┴────────────────────┘
```

### Configuration Options

#### 1. Start Video
- Select which video plays first
- Defaults to Video 1
- Configurable in settings panel

#### 2. Loop Settings
- **On**: Endless loop (Video 15 → Video 1)
- **Off**: Stops after last video
- Toggle with Repeat button

#### 3. Volume
- Adjustable slider (0-100%)
- Mute/Unmute button
- Saved preference (localStorage)

### Video Management

#### Add Video
```typescript
1. Click "Add Video"
2. Enter title: "Song Name - Artist"
3. Upload video file or paste URL
4. Click "Add Video"
```

#### Edit Video
```typescript
1. Click Edit icon (pencil)
2. Modify title or URL
3. Click "Update Video"
```

#### Delete Video
```typescript
1. Click Delete icon (trash)
2. Confirm deletion
3. Video removed from playlist
```

#### Reorder Videos
```typescript
1. Use arrow buttons to move up/down
2. Order saved automatically
3. Reflects in playback sequence
```

### Sample Video Playlist Structure

```json
[
  {
    "id": "1",
    "title": "Summer Vibes - DJ Cool",
    "url": "/media/videos/summer-vibes.mp4",
    "order": 0
  },
  {
    "id": "2",
    "title": "Night City - Electronic Dreams",
    "url": "/media/videos/night-city.mp4",
    "order": 1
  },
  {
    "id": "3",
    "title": "Chill Beats - Lo-Fi Hip Hop",
    "url": "/media/videos/chill-beats.mp4",
    "order": 2
  }
]
```

### API Integration

Videos are stored in localStorage by default. For production:

#### Store in Database
```sql
CREATE TABLE music_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    order_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Backend API Endpoint
```javascript
// backend/src/routes/videos.js
router.get('/api/videos', authenticateToken, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM music_videos ORDER BY order_number'
  );
  res.json(result.rows);
});

router.post('/api/videos', authenticateToken, async (req, res) => {
  const { title, video_url, order_number } = req.body;
  const result = await pool.query(
    'INSERT INTO music_videos (title, video_url, order_number) VALUES ($1, $2, $3) RETURNING *',
    [title, video_url, order_number]
  );
  res.json(result.rows[0]);
});
```

### Recommended Video Setup

#### Retail Store Setup (5-10 videos)
```
1. Upbeat Pop Music
2. Electronic/House Music
3. Chill Instrumental
4. Acoustic/Indie
5. Hip Hop/R&B
6. Jazz/Lounge
7. Rock/Alternative
8. World Music
9. Classical Modern
10. Ambient/Atmospheric
```

#### Restaurant Setup (10-15 videos)
```
1. Soft Jazz
2. Acoustic Guitar
3. Piano Instrumentals
4. Bossa Nova
5. Smooth R&B
6. Light Classical
7. Indie Folk
8. Chill Electronic
9. World Music
10. Lounge Music
11. Soft Rock
12. Contemporary Jazz
13. Ambient Sounds
14. Soul/Blues
15. Easy Listening
```

### Troubleshooting

#### Video Not Playing
- Check file format (MP4 recommended)
- Verify file size < 100MB
- Ensure video URL is accessible
- Check browser console for errors

#### No Sound
- Click volume icon to unmute
- Increase volume slider
- Check system volume
- Verify video has audio track

#### Video Freezing
- Reduce video quality/size
- Check network connection
- Clear browser cache
- Restart browser

#### Playlist Not Looping
- Enable Loop in settings
- Check video count (min 1 video)
- Verify last video transitions

### Performance Tips

1. **Optimize Video Files**
   ```bash
   # Compress with ffmpeg
   ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k output.mp4
   ```

2. **Recommended Video Settings**
   - Resolution: 720p (1280x720)
   - Bitrate: 2-4 Mbps
   - Frame Rate: 30fps
   - Audio: 128kbps AAC

3. **Preload Videos**
   - Videos load on page load
   - Use lazy loading for large playlists
   - Cache videos for faster playback

### Storage Considerations

- Each video averages 20-50MB
- 15 videos ≈ 300-750MB total
- Media storage volume: 950GB available
- Regular cleanup recommended

### User Experience

**Admin View**:
- Full video management access
- Upload, edit, delete videos
- Configure playback settings

**Cashier View**:
- Video player on Sales page
- No management options
- Automatic playback

### Next Steps

1. Upload 3-5 sample videos
2. Test playback on Sales page
3. Adjust volume and settings
4. Add more videos as needed
5. Monitor storage usage

For technical support, see: `MEDIA_STORAGE.md`
