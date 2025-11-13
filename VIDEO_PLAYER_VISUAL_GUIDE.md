# YKZ-POS Sales Page with Video Player - Visual Guide

## 🎨 Complete Layout Overview

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                              YKZ-POS - SALES PAGE                                 ║
╠═══════════════════════════════════════════════════════════════════════════════════╣
║  [Dashboard] [Inventory] [SALES] [Groups] [Reports] [Videos] [Trash] [Database]  ║
╠═══════════════════════╤═══════════════╤═══════════════╤═════════════╤═════════════╣
║   PRODUCT COLUMN 1    │  PRODUCT 2    │  PRODUCT 3    │ VIDEO       │   CART      ║
║                       │               │               │ PLAYER      │             ║
║ ┌─────────────────┐   │┌─────────────┐│┌─────────────┐│┌───────────┐│┌───────────┐║
║ │ KARTU GACHA     │   ││ STANDEE     │││ GANCHI      │││ 🎬 VIDEO  │││  🛒 CART  ║
║ │                 │   ││ 15CM        │││             │││           │││           ║
║ │ 📷 [IMAGE]      │   ││📷 [IMAGE]   │││📷 [IMAGE]   │││ ┌───────┐ │││ Items:    ║
║ │                 │   ││             │││             │││ │ Video │ │││ • None    ║
║ │ CARD            │   ││ CARD        │││ CARD        │││ │Playing│ │││           ║
║ │ Rp 35,000       │   ││ Rp XX,XXX   │││ Rp XX,XXX   │││ │       │ │││           ║
║ │ Stock: 100      │   ││ Stock: XX   │││ Stock: XX   │││ │ 🔊    │ │││           ║
║ │                 │   ││             │││             │││ └───────┘ │││           ║
║ │ [-] 0 [+]       │   ││[-] 0 [+]    │││[-] 0 [+]    │││           │││           ║
║ └─────────────────┘   │└─────────────┘│└─────────────┘││ Video 3/10│││  Total:   ║
║                       │               │               │││           │││ Rp 0      ║
║ ┌─────────────────┐   │┌─────────────┐│┌─────────────┐││ [⏮][▶][⏭]│││           ║
║ │ STICKER         │   ││ LIGHTSTICK  │││ STANDEE 1:1 │││ [🔁] Loop │││           ║
║ │                 │   ││ 15 COLORS   │││             │││           │││[Complete] ║
║ │ 📷 [IMAGE]      │   ││📷 [IMAGE]   │││📷 [IMAGE]   │││ 🔊 ───70% │││ Sale      ║
║ │                 │   ││             │││             │││           │││           ║
║ │ STATIONERY      │   ││ MERCHANDISE │││ CARD        │││ Playlist: │││           ║
║ │ Rp XX,XXX       │   ││ Rp XX,XXX   │││ Rp XX,XXX   │││ 1.Song 1✓│││           ║
║ │ Stock: XX       │   ││ Stock: XX   │││ Stock: XX   │││ 2.Song 2 │││           ║
║ │                 │   ││             │││             │││ 3.Song 3 │││           ║
║ │ [-] 0 [+]       │   ││[-] 0 [+]    │││[-] 0 [+]    │││ 4.Song 4 │││           ║
║ └─────────────────┘   │└─────────────┘│└─────────────┘││ 5.Song 5 │││           ║
║                       │               │               │││ ...      │││           ║
║ ┌─────────────────┐   │┌─────────────┐│┌─────────────┐│└───────────┘│└───────────┘║
║ │ CAN BADGE       │   ││ PHOTOCARD   │││ POSTER      │││             │             ║
║ │ ...             │   ││ ...         │││ ...         │││             │             ║
║ └─────────────────┘   │└─────────────┘│└─────────────┘│└─────────────┴─────────────┘
║                       │               │               │                            ║
╚═══════════════════════╧═══════════════╧═══════════════╧════════════════════════════╝
```

## 📱 Responsive Breakdown

### Desktop View (5 Columns)
```
[Products 60%] [Video 20%] [Cart 20%]
    3 cols        1 col       1 col
```

### Tablet View (3 Columns)
```
[Products 66%] [Video+Cart 33%]
   2 cols           1 col
```

### Mobile View (1 Column)
```
[Products]
[Video Player]
[Cart]
(Stacked vertically)
```

## 🎵 Video Player Details

### Main Video Display
```
┌────────────────────────────┐
│                            │
│    🎬 Video Playing        │
│                            │
│   [Fullscreen Display]     │
│                            │
│                            │
└────────────────────────────┘
  "Summer Vibes - DJ Cool"
  Video 3 of 10
```

### Control Panel
```
┌────────────────────────────┐
│  Select Video: [Dropdown▼] │
├────────────────────────────┤
│   [⏮️]  [▶️/⏸️]  [⏭️]  [🔁] │
├────────────────────────────┤
│  🔊 ────────●────────  70% │
└────────────────────────────┘
```

### Playlist View
```
┌────────────────────────────┐
│ Playlist (10 videos)       │
├────────────────────────────┤
│ ✓ 1. Summer Vibes          │ ← Currently playing
│   2. Night City            │
│   3. Chill Beats           │
│   4. Electronic Dreams     │
│   5. Lo-Fi Hip Hop         │
│   ...                      │
└────────────────────────────┘
```

## 🎯 Video Player States

### Playing State
```
┌──────────────┐
│ ▶️ Playing   │
│ 🎵 Audio ON  │
│ 🔁 Loop ON   │
│ 🔊 Vol: 70%  │
└──────────────┘
```

### Paused State
```
┌──────────────┐
│ ⏸️ Paused    │
│ 🎵 Audio ON  │
│ 🔁 Loop ON   │
│ 🔊 Vol: 70%  │
└──────────────┘
```

### Muted State
```
┌──────────────┐
│ ▶️ Playing   │
│ 🔇 Muted     │
│ 🔁 Loop ON   │
│ 🔊 Vol: 0%   │
└──────────────┘
```

## 🔄 Video Flow Diagram

### Automatic Loop Flow
```
Start → Video 1 → Video 2 → Video 3 → ... → Video 15 → Back to Video 1
  ↑                                                              ↓
  └──────────────────────────────────────────────────────────────┘
                         (Continuous Loop)
```

### Manual Navigation
```
User Clicks Next:
Current Video 5 → Immediately Jump → Video 6

User Clicks Previous:
Current Video 5 → Immediately Jump → Video 4

User Selects from Dropdown:
Current Video 5 → Immediately Jump → Video 12
```

## 📊 Video Management Interface

### Admin Video Management Page
```
╔════════════════════════════════════════════════════════════════╗
║                    VIDEO MANAGEMENT                            ║
║  Manage music videos for sales display (5/15 videos)          ║
║                                        [+ Add Video]           ║
╠═══════════════════════════╤════════════════════════════════════╣
║  VIDEO PLAYLIST           │  VIDEO PREVIEW                     ║
║                           │                                    ║
║  ┌────────────────────┐   │  ┌──────────────────────────────┐ ║
║  │ #  Title     Actions│   │  │                              │ ║
║  ├────────────────────┤   │  │      🎬 Video Playing         │ ║
║  │ 1  Summer... ✏️ 🗑️ │   │  │                              │ ║
║  │ 2  Night ... ✏️ 🗑️ │   │  │   [Live Preview Player]      │ ║
║  │ 3  Chill ... ✏️ 🗑️ │   │  │                              │ ║
║  │ 4  Electro.. ✏️ 🗑️ │   │  └──────────────────────────────┘ ║
║  │ 5  Lo-Fi  .. ✏️ 🗑️ │   │   "Summer Vibes - DJ Cool"        ║
║  └────────────────────┘   │   Video 1 of 5                    ║
║                           │                                    ║
║                           │   [⏮️]  [▶️]  [⏭️]  [🔁]          ║
║                           │   🔊 ────────●────────  70%       ║
╚═══════════════════════════╧════════════════════════════════════╝
```

### Add Video Dialog
```
┌─────────────────────────────────────┐
│  Add New Video                      │
├─────────────────────────────────────┤
│  Video Title:                       │
│  [Summer Vibes - DJ Cool        ]   │
│                                     │
│  Video File:                        │
│  ┌─────────────────────────────┐   │
│  │  📤 Upload Video            │   │
│  │  (Click or drag & drop)     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Or Video URL:                      │
│  [/media/videos/summer.mp4      ]   │
│                                     │
│         [Add Video]                 │
└─────────────────────────────────────┘
```

## 🎨 Color Scheme

### Video Player Theme
- **Background**: Black (#000000)
- **Controls**: Primary color
- **Text**: White on dark background
- **Active State**: Primary color highlight
- **Progress Bar**: Primary gradient

## 💡 User Interactions

### Cashier Flow
```
1. Open Sales Page
2. See video playing automatically
3. Select products as normal
4. Enjoy background music
5. (Optional) Adjust volume
6. Complete sale
```

### Admin Flow
```
1. Login as admin
2. Navigate to Videos
3. Click "Add Video"
4. Upload video file
5. Enter title
6. Click "Add Video"
7. Video appears in playlist
8. Video plays on Sales page
```

## 🔧 Settings Panel

### Expandable Settings
```
┌────────────────────────────┐
│  ⚙️ Settings               │
├────────────────────────────┤
│  Start Video: [Dropdown ▼] │
│  • Video 1                 │
│  • Video 2                 │
│  • ...                     │
│                            │
│  Loop Playlist:  [ON] OFF  │
│                            │
│  Autoplay:      [ON] OFF   │
└────────────────────────────┘
```

## 📐 Dimensions

### Video Player
- **Width**: Full column width
- **Height**: 16:9 aspect ratio
- **Min Width**: 280px
- **Max Width**: 400px
- **Position**: Sticky (stays visible on scroll)

### Control Buttons
- **Size**: 40x40px (Play/Pause)
- **Size**: 32x32px (Other controls)
- **Spacing**: 8px gap

### Volume Slider
- **Width**: 100% of control area
- **Height**: 4px
- **Thumb Size**: 16x16px

## 🎯 Key Features Visualization

### 1. Automatic Looping
```
Video Sequence:
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 1 → 2 → ...
                                    ↑          ↓
                                    └──────────┘
```

### 2. Volume Control
```
0% ────────────────────── 100%
🔇                        🔊

Click anywhere to jump:
[━━━━●━━━━━━━━━] 40%
```

### 3. Playlist Selection
```
Click on any video to play:
┌──────────────┐
│ 1. Song 1    │ ← Click
│ 2. Song 2    │ ← Click
│ 3. Song 3 ✓  │ ← Currently playing
│ 4. Song 4    │ ← Click
└──────────────┘
```

## 🚀 Quick Access

### URLs
- **Sales Page**: http://localhost:3000/sales
- **Video Management**: http://localhost:3000/videos
- **Media Upload**: Use built-in upload component

### Login
- **Admin**: admin / 12345
- **Cashier**: cashier / 12345

---

*Visual guide for YKZ-POS Video Player Feature*
*Updated: November 13, 2025*
