# 🎵 Video Player Quick Reference Card

## 🎯 What Was Added?

A **music video player** that displays next to your sales products, playing 3-15 videos continuously with full audio.

---

## 📍 Where to Find It?

### For Admins:
1. **Video Management**: Navigation → "Videos" button
2. **Video Player**: Visible on Sales page (middle column)

### For Cashiers:
- **Video Player**: Visible on Sales page (middle column)

---

## 🎨 Layout

```
Sales Page Layout:

┌─────────┬───────┬──────┐
│Products │Video  │Cart  │
│(60%)    │Player │(20%) │
│         │(20%)  │      │
└─────────┴───────┴──────┘
```

---

## ⚡ Quick Start (3 Steps)

### Step 1: Login as Admin
```
Username: admin
Password: 12345
```

### Step 2: Add Videos
1. Click "Videos" in sidebar
2. Click "Add Video" button
3. Upload video file (max 100MB)
4. Enter video title
5. Click "Add Video"
6. Repeat 3-15 times

### Step 3: View on Sales Page
- Go to Sales page
- Video player appears automatically
- Videos play in loop

---

## 🎮 Controls

### Basic Controls
- **▶️/⏸️** = Play/Pause
- **⏮️** = Previous video
- **⏭️** = Next video
- **🔁** = Toggle loop on/off

### Volume Controls
- **🔊** = Volume slider (0-100%)
- **🔇** = Mute/Unmute button

### Advanced
- **Dropdown** = Select specific video
- **Playlist** = Click any video to play

---

## 📝 Video Requirements

| Aspect | Requirement |
|--------|-------------|
| Format | MP4, WebM, MOV, AVI |
| Size | Max 100MB per video |
| Quantity | 3-15 videos |
| Audio | Included in video |
| Resolution | 720p recommended |

---

## 🔄 How Looping Works

```
Video 1 → Video 2 → ... → Video 15 → Back to Video 1
  ↓                                        ↑
  └────────────────────────────────────────┘
           (Continuous Loop)
```

**Start Position**: Choose which video plays first (Settings)

---

## 🎯 Key Features

✅ **Automatic Playback**: Starts when Sales page loads
✅ **Continuous Loop**: Never stops playing
✅ **Volume Control**: Adjustable 0-100%
✅ **Skip Navigation**: Next/Previous buttons
✅ **Playlist View**: See all videos
✅ **Start Position**: Configurable
✅ **No Interruption**: Doesn't affect sales

---

## 👥 Permissions

### Admin Can:
- ✅ Add/Edit/Delete videos
- ✅ Reorder playlist
- ✅ Access Video Management
- ✅ Control playback on Sales

### Cashier Can:
- ✅ View player on Sales page
- ✅ Control playback (play/pause/volume)
- ❌ Cannot manage videos

---

## 📂 File Locations

### Code Files
```
src/components/VideoPlayer.tsx
src/pages/VideoManagement.tsx
src/pages/Sales.tsx (updated)
```

### Routes
```
/videos  → Video Management (Admin only)
/sales   → Sales with Video Player
```

### Storage
```
localStorage['musicVideos']  → Video playlist
/app/uploads/videos/         → Video files
```

---

## 🔧 Troubleshooting

### Video Not Playing?
1. Check video format (MP4 recommended)
2. Verify file size < 100MB
3. Refresh browser
4. Check browser console

### No Sound?
1. Click unmute button 🔊
2. Increase volume slider
3. Check system volume
4. Verify video has audio

### Video Not Looping?
1. Enable Loop button (🔁)
2. Check video count > 0
3. Verify playlist not empty

---

## 💡 Tips

### Best Practices
- Upload 5-10 videos for variety
- Use 720p resolution
- Keep videos under 50MB
- Use upbeat, family-friendly music
- Test volume before opening hours

### Performance
- Preload videos on page load
- Videos cached by browser
- Smooth playback on modern browsers

---

## 📊 Video Management

### Add Video
```
Videos → Add Video → Upload → Enter Title → Add
```

### Edit Video
```
Videos → Click Edit (✏️) → Update → Save
```

### Delete Video
```
Videos → Click Delete (🗑️) → Confirm
```

### Reorder
```
Videos → Use arrow buttons to move up/down
```

---

## 🎵 Sample Playlist Ideas

### Retail Store
```
1. Upbeat Pop
2. Electronic Music
3. Chill Beats
4. Indie Rock
5. Hip Hop
```

### Restaurant
```
1. Soft Jazz
2. Acoustic Guitar
3. Bossa Nova
4. Lounge Music
5. Classical Modern
```

### Cafe
```
1. Lo-Fi Hip Hop
2. Indie Folk
3. Chill Electronic
4. Coffee Shop Vibes
5. Acoustic Covers
```

---

## 📱 Access Points

| Page | URL | Who Can Access |
|------|-----|----------------|
| Video Management | /videos | Admin only |
| Sales with Player | /sales | Admin & Cashier |
| Video Upload | /videos → Add Video | Admin only |

---

## 🎨 Visual Summary

```
┌──────────────────────────────────────┐
│        YKZ-POS Sales Page            │
├───────────┬──────────┬───────────────┤
│  Product  │  🎬      │   🛒 Cart     │
│  Product  │  Video   │   Items       │
│  Product  │  Playing │   Total       │
│  Product  │          │   [Buy]       │
│  Product  │  [⏮▶⏭]  │               │
│  Product  │  🔊──70% │               │
└───────────┴──────────┴───────────────┘
```

---

## 📚 Documentation

- **VIDEO_SETUP_GUIDE.md** - Complete setup guide
- **VIDEO_PLAYER_SUMMARY.md** - Technical details
- **VIDEO_PLAYER_VISUAL_GUIDE.md** - Visual layouts
- **MEDIA_STORAGE.md** - Media API reference

---

## 🚀 System Status

✅ **Frontend**: Running on port 3000
✅ **Backend**: Running on port 3001
✅ **Database**: PostgreSQL on port 5432
✅ **Media Storage**: 950GB available
✅ **Video Player**: Fully functional

---

## 📞 Support

### Check Logs
```bash
docker logs ykz-pos-frontend
docker logs ykz-pos-backend
```

### Restart Services
```bash
docker compose restart frontend
docker compose restart backend
```

---

**🎉 Enjoy your new video player feature!**

*Quick Reference Card v1.0*
*YKZ-POS Video Player*
