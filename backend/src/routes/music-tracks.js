const express = require('express');
const router = express.Router();
const { dbUtils } = require('../config/database-sqlite');

// Get all music tracks
router.get('/', async (req, res) => {
  try {
    const tracks = await dbUtils.all(
      'SELECT * FROM music_tracks ORDER BY order_index ASC'
    );
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching music tracks:', error);
    res.status(500).json({ error: 'Failed to fetch music tracks' });
  }
});

// Get single music track
router.get('/:id', async (req, res) => {
  try {
    const track = await dbUtils.get(
      'SELECT * FROM music_tracks WHERE id = ?',
      [req.params.id]
    );
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    res.json(track);
  } catch (error) {
    console.error('Error fetching music track:', error);
    res.status(500).json({ error: 'Failed to fetch music track' });
  }
});

// Create new music track
router.post('/', async (req, res) => {
  try {
    const { title, url, order_index, duration, file_size, mime_type } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const result = await dbUtils.run(
      `INSERT INTO music_tracks (title, url, order_index, duration, file_size, mime_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, url, order_index || 0, duration, file_size, mime_type]
    );

    const newTrack = await dbUtils.get(
      'SELECT * FROM music_tracks WHERE rowid = ?',
      [result.id]
    );

    res.status(201).json(newTrack);
  } catch (error) {
    console.error('Error creating music track:', error);
    res.status(500).json({ error: 'Failed to create music track' });
  }
});

// Update music track
router.put('/:id', async (req, res) => {
  try {
    const { title, url, order_index, duration, file_size, mime_type } = req.body;
    
    const result = await dbUtils.run(
      `UPDATE music_tracks 
       SET title = ?, url = ?, order_index = ?, duration = ?, file_size = ?, mime_type = ?, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [title, url, order_index, duration, file_size, mime_type, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const updatedTrack = await dbUtils.get(
      'SELECT * FROM music_tracks WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedTrack);
  } catch (error) {
    console.error('Error updating music track:', error);
    res.status(500).json({ error: 'Failed to update music track' });
  }
});

// Update track order (bulk update for drag & drop)
router.put('/reorder/bulk', async (req, res) => {
  try {
    const { tracks } = req.body; // Array of { id, order_index }
    
    if (!Array.isArray(tracks)) {
      return res.status(400).json({ error: 'Tracks array is required' });
    }

    // Update all tracks in a transaction
    for (const track of tracks) {
      await dbUtils.run(
        'UPDATE music_tracks SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [track.order_index, track.id]
      );
    }

    const updatedTracks = await dbUtils.all(
      'SELECT * FROM music_tracks ORDER BY order_index ASC'
    );

    res.json(updatedTracks);
  } catch (error) {
    console.error('Error reordering tracks:', error);
    res.status(500).json({ error: 'Failed to reorder tracks' });
  }
});

// Delete music track
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbUtils.run(
      'DELETE FROM music_tracks WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting music track:', error);
    res.status(500).json({ error: 'Failed to delete music track' });
  }
});

module.exports = router;
