import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface Video {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface AudioPlayerContextType {
  videos: Video[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  setCurrentIndex: (index: number) => void;
  setIsLooping: (loop: boolean) => void;
  loadVideos: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider = ({ children }: AudioPlayerProviderProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIdRef = useRef<string | null>(null);

  // Load videos from localStorage
  const loadVideos = () => {
    const saved = localStorage.getItem('musicTracks');
    if (saved) {
      const newVideos = JSON.parse(saved);
      
      // Find if the current playing track still exists in the new list
      if (currentTrackIdRef.current && videos.length > 0) {
        const currentTrack = videos[currentIndex];
        const newIndex = newVideos.findIndex((v: Video) => v.id === currentTrack.id);
        
        // If the same track exists, update index to new position
        if (newIndex !== -1) {
          setVideos(newVideos);
          if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
          }
          return; // Don't reload audio if it's the same track
        }
      }
      
      setVideos(newVideos);
    }
  };

  // Initialize audio element and load videos
  useEffect(() => {
    loadVideos();
    
    // Create audio element
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Event listeners
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (isLooping) {
        if (currentIndex < videos.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Load new track when index changes
  useEffect(() => {
    if (audioRef.current && videos.length > 0 && videos[currentIndex]) {
      const currentTrack = videos[currentIndex];
      const url = currentTrack.url;
      const fullUrl = url.startsWith('/') ? url : '/' + url;
      
      // Only reload if the track ID has changed
      if (currentTrackIdRef.current !== currentTrack.id) {
        currentTrackIdRef.current = currentTrack.id;
        audioRef.current.src = fullUrl;
        audioRef.current.load();
        
        if (isPlaying) {
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [currentIndex, videos]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const play = () => {
    if (audioRef.current && videos.length > 0) {
      audioRef.current.play().catch(console.error);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const next = () => {
    if (videos.length === 0) return;
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (isLooping) {
      setCurrentIndex(0);
    }
  };

  const previous = () => {
    if (videos.length === 0) return;
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (isLooping) {
      setCurrentIndex(videos.length - 1);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const value: AudioPlayerContextType = {
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
    setCurrentIndex,
    setIsLooping,
    loadVideos,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
