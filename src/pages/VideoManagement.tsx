import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import MediaUpload from '@/components/MediaUpload';
import VideoPlayer from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Play, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Video {
  id: string;
  title: string;
  url: string;
  order: number;
  thumbnail?: string;
}

// Sortable Row Component
function SortableRow({ 
  video, 
  index, 
  onEdit, 
  onDelete 
}: { 
  video: Video; 
  index: number; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'bg-muted' : ''}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
          <span className="font-mono text-sm">{index + 1}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {video.title}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', url: '', order: 0 });
  const { toast } = useToast();
  const audioPlayer = useAudioPlayer();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    // Load from localStorage for now
    const savedVideos = localStorage.getItem('musicTracks');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    }
    setLoading(false);
  };

  const saveVideos = (updatedVideos: Video[]) => {
    localStorage.setItem('musicTracks', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
  };

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.url) {
      toast({
        title: "Error",
        description: "Please provide a title and upload an audio file",
        variant: "destructive",
      });
      return;
    }

    if (videos.length >= 15) {
      toast({
        title: "Limit Reached",
        description: "Maximum 15 tracks allowed",
        variant: "destructive",
      });
      return;
    }

    const video: Video = {
      id: Date.now().toString(),
      title: newVideo.title,
      url: newVideo.url,
      order: videos.length,
    };

    saveVideos([...videos, video]);
    
    // Reload the audio player
    audioPlayer.loadVideos();
    
    // Reset form and close dialog
    setNewVideo({ title: '', url: '', order: 0 });
    setDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Audio track added successfully",
    });
  };

  const handleUpdateVideo = () => {
    if (!editingVideo || !editingVideo.title || !editingVideo.url) {
      toast({
        title: "Error",
        description: "Please provide a title and upload an audio file",
        variant: "destructive",
      });
      return;
    }

    const updatedVideos = videos.map(v => 
      v.id === editingVideo.id ? editingVideo : v
    );
    
    saveVideos(updatedVideos);
    
    // Reload the audio player
    audioPlayer.loadVideos();
    
    setEditingVideo(null);
    setDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Audio track updated successfully",
    });
  };

  const handleDeleteVideo = (id: string) => {
    const updatedVideos = videos
      .filter(v => v.id !== id)
      .map((v, index) => ({ ...v, order: index }));
    
    saveVideos(updatedVideos);
    
    // Reload the audio player
    audioPlayer.loadVideos();
    
    toast({
      title: "Success",
      description: "Audio track deleted successfully",
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = videos.findIndex((v) => v.id === active.id);
      const newIndex = videos.findIndex((v) => v.id === over.id);

      const reorderedVideos = arrayMove(videos, oldIndex, newIndex)
        .map((v, index) => ({ ...v, order: index }));

      saveVideos(reorderedVideos);
      audioPlayer.loadVideos();

      toast({
        title: "Reordered",
        description: "Track order updated successfully",
      });
    }
  };

  const handleVideoUpload = (url: string, type: 'image' | 'video', filename?: string) => {
    console.log('handleVideoUpload called:', { url, type, filename });
    
    if (editingVideo) {
      const shouldUseFilename = !editingVideo.title.trim();
      const newTitle = shouldUseFilename ? (filename || editingVideo.title) : editingVideo.title;
      console.log('Editing video - shouldUseFilename:', shouldUseFilename, 'newTitle:', newTitle);
      
      setEditingVideo({ 
        ...editingVideo, 
        url,
        title: newTitle
      });
    } else {
      const shouldUseFilename = !newVideo.title.trim();
      const newTitle = shouldUseFilename ? (filename || '') : newVideo.title;
      console.log('New video - shouldUseFilename:', shouldUseFilename, 'newTitle:', newTitle, 'current newVideo.title:', newVideo.title);
      
      setNewVideo({ 
        ...newVideo, 
        url,
        title: newTitle
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Music Management</h1>
            <p className="text-muted-foreground">
              Manage music tracks for the sales display ({videos.length}/15 tracks)
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingVideo(null);
                  setNewVideo({ title: '', url: '', order: videos.length });
                }}
                disabled={videos.length >= 15}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Track
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVideo ? 'Edit Track' : 'Add New Track'}
                </DialogTitle>
                <DialogDescription>
                  {editingVideo 
                    ? 'Update the track information below' 
                    : 'Add a new music track to the playlist (max 15 tracks). Upload a video and it will be auto-converted to MP3 audio.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Track Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Vibes - Artist Name"
                    value={editingVideo ? editingVideo.title : newVideo.title}
                    onChange={(e) => {
                      if (editingVideo) {
                        setEditingVideo({ ...editingVideo, title: e.target.value });
                      } else {
                        setNewVideo({ ...newVideo, title: e.target.value });
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Audio/Video File</Label>
                  <MediaUpload
                    label="Upload Audio or Video"
                    accept="video/*,audio/*"
                    maxSize={600}
                    currentUrl={editingVideo?.url || newVideo.url}
                    onUploadComplete={handleVideoUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    Videos will be automatically converted to MP3 audio
                  </p>
                </div>

                <Button 
                  onClick={editingVideo ? handleUpdateVideo : handleAddVideo}
                  className="w-full"
                >
                  {editingVideo ? 'Update Track' : 'Add Track'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Track List */}
          <Card>
            <CardHeader>
              <CardTitle>Music Playlist</CardTitle>
              <CardDescription>
                Manage the order and details of music tracks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {videos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tracks added yet</p>
                  <p className="text-sm">Add 3-15 music tracks to get started</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">#</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <SortableContext
                        items={videos.map(v => v.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {videos.map((video, index) => (
                          <SortableRow
                            key={video.id}
                            video={video}
                            index={index}
                            onEdit={() => {
                              setEditingVideo(video);
                              setDialogOpen(true);
                            }}
                            onDelete={() => handleDeleteVideo(video.id)}
                          />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
              )}
            </CardContent>
          </Card>

          {/* Music Preview */}
          {videos.length > 0 && (
            <div>
              <VideoPlayer 
                videos={videos}
                autoplay={false}
                loop={true}
                startIndex={0}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
