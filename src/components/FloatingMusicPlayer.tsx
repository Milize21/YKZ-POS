import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, X, ListMusic, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingMusicPlayer = () => {
  const {
    videos,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLooping,
    play,
    pause,
    next,
    previous,
    setVolume,
    seek,
    setIsLooping,
    setCurrentIndex,
  } = useAudioPlayer();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);

  if (videos.length === 0 || !showPlayer) return null;

  const currentTrack = videos[currentIndex];
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 border-t border-white/10 shadow-2xl">
      {/* Playlist Dropdown */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <ListMusic className="h-4 w-4" />
                  Playlist ({videos.length} tracks)
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlaylist(false)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {videos.map((video, index) => (
                  <motion.button
                    key={video.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 group ${
                      index === currentIndex
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-mono opacity-60 w-6">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{video.title}</div>
                    </div>
                    {index === currentIndex && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1"
                      >
                        {isPlaying ? (
                          <div className="flex items-center gap-0.5">
                            <motion.div
                              animate={{ height: [4, 12, 4] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                              className="w-1 bg-white rounded-full"
                            />
                            <motion.div
                              animate={{ height: [4, 12, 4] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                              className="w-1 bg-white rounded-full"
                            />
                            <motion.div
                              animate={{ height: [4, 12, 4] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                              className="w-1 bg-white rounded-full"
                            />
                          </div>
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold truncate">{currentTrack?.title}</div>
            <div className="text-white/60 text-sm">
              Track {currentIndex + 1} of {videos.length}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`text-white hover:bg-white/10 ${showPlaylist ? 'bg-white/20' : ''}`}
              title="Show playlist"
            >
              {showPlaylist ? <ChevronDown className="h-4 w-4" /> : <ListMusic className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={previous}
              className="text-white hover:bg-white/10"
              disabled={!isLooping && currentIndex === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              onClick={isPlaying ? pause : play}
              className="bg-white text-purple-900 hover:bg-white/90 h-10 w-10"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              className="text-white hover:bg-white/10"
              disabled={!isLooping && currentIndex === videos.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLooping(!isLooping)}
              className={`text-white hover:bg-white/10 ${isLooping ? 'bg-white/20' : ''}`}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-white/80 text-sm w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              onValueChange={(value) => seek(value[0])}
              max={duration || 100}
              step={0.1}
              className="flex-1"
            />
            <span className="text-white/80 text-sm w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 70 : 0)}
              className="text-white hover:bg-white/10"
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="w-24"
            />
          </div>

          {/* Minimize/Close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
