import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Repeat
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
}

interface VideoPlayerProps {
  videos?: Video[];
  autoplay?: boolean;
  loop?: boolean;
  startIndex?: number;
}

export default function VideoPlayer({ 
  videos = [], 
  autoplay = true, 
  loop = true,
  startIndex = 0 
}: VideoPlayerProps) {
  const {
    videos: contextVideos,
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
    setCurrentIndex,
    setIsLooping,
  } = useAudioPlayer();

  // Use context videos if available, otherwise use prop videos
  const displayVideos = contextVideos.length > 0 ? contextVideos : videos;
  const currentVideo = displayVideos[currentIndex];

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (displayVideos.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Music Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No music available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Music Player
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Display with Visualizer */}
        <div className="relative aspect-video bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden flex items-center justify-center">
          {/* Music Visualizer Effect */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{
                    height: `${20 + Math.random() * 60}px`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: isPlaying ? 0.8 : 0.3
                  }}
                />
              ))}
            </div>
            
            <div>
              <p className="text-white font-bold text-2xl mb-2">{currentVideo?.title}</p>
              <p className="text-white/70 text-lg">
                Track {currentIndex + 1} of {displayVideos.length}
              </p>
              <p className="text-white/50 text-sm mt-2">
                {isPlaying ? '♪ Now Playing' : '⏸ Paused'}
              </p>
            </div>
          </div>
        </div>

        {/* Video Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Track</label>
          <Select
            value={currentIndex.toString()}
            onValueChange={(value) => setCurrentIndex(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {displayVideos.map((video, index) => (
                <SelectItem key={video.id} value={index.toString()}>
                  {index + 1}. {video.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                onValueChange={(value) => seek(value[0])}
                max={duration || 100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Play Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previous}
              disabled={!isLooping && currentIndex === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              onClick={isPlaying ? pause : play}
              className="h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              disabled={!isLooping && currentIndex === displayVideos.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsLooping(!isLooping)}
              className={isLooping ? "bg-primary text-primary-foreground" : ""}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 70 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            
            <span className="text-sm text-muted-foreground w-12 text-right">
              {volume}%
            </span>
          </div>
        </div>

        {/* Playlist */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Playlist ({displayVideos.length} tracks)</label>
          <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border p-2">
            {displayVideos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => setCurrentIndex(index)}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  currentIndex === index
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="font-medium">{index + 1}.</span> {video.title}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
