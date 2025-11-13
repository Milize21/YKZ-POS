# Yorukaze POS - Offline & Local Setup Guide

## 🎯 Fix "Storage Quota Exceeded" Error

### Quick Fix (Immediate):
1. Open the application
2. Go to **Database Settings** page (gear icon in sidebar)
3. Click **"Migrate Images to IndexedDB"** button
4. Wait for migration to complete
5. Page will reload automatically
6. ✅ Error should be gone!

### What This Does:
- Moves all product images from localStorage (5-10MB limit) to IndexedDB (50-500MB+ capacity)
- Compresses images to 600px max width, 70% JPEG quality
- Frees up 95%+ of localStorage space
- Keeps all your data safe

---

## 🌐 Run Locally Without WiFi/Internet

### Option 1: PWA (Progressive Web App) - RECOMMENDED
Your app is now installable and works offline!

**On Desktop (Chrome/Edge):**
1. Visit the app in your browser
2. Look for install icon (➕) in address bar
3. Click "Install"
4. App opens in its own window
5. Works offline without internet!

**On Mobile (Android/iOS):**
1. Open app in browser (Chrome/Safari)
2. Tap menu (⋮) → "Add to Home Screen"
3. Open from home screen icon
4. Works offline completely!

### Option 2: Local Server (Always Available)
```bash
# Start local development server
npm run dev

# Access at: http://localhost:8080 or http://localhost:8081
```

**Keep it running 24/7:**
```bash
# Build production version
npm run build

# Serve production build
npm install -g serve
serve -s dist -p 8080

# Or use http-server
npm install -g http-server
http-server dist -p 8080
```

### Option 3: Standalone Executable (Future Enhancement)
For a true offline desktop app, consider:
- **Electron** wrapper (desktop app)
- **Tauri** (lightweight, Rust-based)
- **Capacitor** (mobile app)

---

## 📦 Storage Information

### Current Setup:
- **localStorage**: Stores product data, sales, settings (lightweight JSON)
- **IndexedDB**: Stores product images (heavy binary data)
- **Service Worker**: Caches HTML/CSS/JS for offline access

### Storage Limits:
| Storage Type | Capacity | Used For |
|--------------|----------|----------|
| localStorage | 5-10 MB | Product info, sales data |
| IndexedDB | 50-500+ MB | Product images |
| Cache Storage | 50+ MB | App files (HTML/CSS/JS) |

### Monitor Storage:
1. Go to Database Settings
2. Check "Browser Storage" card
3. Shows usage percentage and available space

---

## 🔧 Troubleshooting

### Still Getting Storage Error?
1. Clear browser cache: `Ctrl + Shift + Delete`
2. Click "Migrate Images to IndexedDB" again
3. If persists, export backup and clear database
4. Import backup (will use IndexedDB automatically)

### App Not Working Offline?
1. Check service worker: Open DevTools → Application → Service Workers
2. Should show "Activated and running"
3. Try unregister and refresh page
4. Service worker will re-register

### Images Not Loading?
1. Open Browser DevTools → Application → IndexedDB
2. Look for "YorukazePOS" database
3. Check if "images" store has data
4. Re-run migration if empty

### Performance Issues?
1. Go to Database Settings → "Optimize Database"
2. Removes duplicate data and compresses storage
3. Reduces load times

---

## 💾 Backup & Restore

### Regular Backups (IMPORTANT):
1. Go to Database Settings
2. Click "Export Backup"
3. Save JSON file to safe location
4. Do this weekly or before major changes

### Restore from Backup:
1. Database Settings → "Import Backup"
2. Select your .json backup file
3. All data restores including images
4. Images automatically use IndexedDB

---

## 🚀 Network-Free Operation

### What Works Offline:
✅ Add/Edit/Delete products
✅ Process sales transactions
✅ Generate receipts
✅ View reports
✅ Manage inventory
✅ Restore from trash
✅ Export data

### What Requires Internet:
❌ Initial app load (first time only)
❌ Updating app to new version
❌ External QR code generation (if using online service)

### Local Network Access:
If you want other devices on your network to access:
```bash
# Find your local IP
ipconfig  # Windows: Look for IPv4 Address (e.g., 192.168.1.100)

# Start server with network access
npm run dev -- --host

# Access from other devices:
http://192.168.1.100:8080
```

---

## 📱 Mobile Usage

### Install as App:
1. Open in mobile browser
2. Add to Home Screen
3. Opens like native app
4. No app store needed!

### Offline Sync:
- All data stored locally on device
- No cloud sync (privacy first)
- Export/Import to transfer between devices

---

## 🔐 Data Privacy

### Where Your Data Lives:
- **100% Local**: All data stays on your device
- **No Cloud**: No external servers
- **No Tracking**: No analytics or telemetry
- **Fully Private**: Only you have access

### Transfer Between Computers:
1. Export backup from old device
2. Import backup to new device
3. All data transfers including images

---

## 📞 Support

If you continue to have issues:
1. Check browser console for errors (F12)
2. Try different browser (Chrome recommended)
3. Verify at least 100MB free disk space
4. Update browser to latest version

**Browser Requirements:**
- Chrome 80+ (Recommended)
- Edge 80+
- Firefox 75+
- Safari 13+

---

## 🎨 Create App Icons

Replace placeholder icons with your logo:

**Required Sizes:**
- `public/icon-192.png` - 192x192 pixels
- `public/icon-512.png` - 512x512 pixels

**Quick Online Tools:**
- https://realfavicongenerator.net/
- https://favicon.io/
- Use your Yorukaze logo!

---

## ✨ Features Enabled

- ✅ Offline-first architecture
- ✅ IndexedDB for unlimited storage
- ✅ Service Worker caching
- ✅ PWA installable
- ✅ Automatic image compression
- ✅ Migration tool included
- ✅ Local-only operation
- ✅ No internet required (after install)

**Your POS system now works completely offline!** 🎉
