import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, ShieldAlert, Calendar, HardDrive, FileVideo, Clock, Loader } from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const statusBadge = {
  safe: { icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Safe' },
  flagged: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Flagged' },
  processing: { icon: Loader, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Processing' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending' },
};

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/videos/${id}`);
        setVideo(res.data.video);
      } catch (err) {
        toast.error('Failed to load video');
        navigate('/videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id, navigate]);

  useSocket({
    onProgress: (data) => {
      if (data.videoId === id) {
        setVideo((prev) => prev ? { ...prev, status: 'processing', processingProgress: data.progress, processingStage: data.stage } : prev);
      }
    },
    onComplete: (data) => {
      if (data.videoId === id) {
        setVideo((prev) => prev ? { ...prev, status: data.status, processingProgress: 100, processingStage: 'Complete' } : prev);
        toast.success(`Analysis complete: ${data.status === 'safe' ? 'Safe' : 'Flagged'}`);
      }
    },
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-20" />
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="aspect-video bg-gray-700" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/2" />
            <div className="grid grid-cols-4 gap-4 pt-4"><div className="h-10 bg-gray-700 rounded" /><div className="h-10 bg-gray-700 rounded" /><div className="h-10 bg-gray-700 rounded" /><div className="h-10 bg-gray-700 rounded" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) return null;

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const streamUrl = video.cloudinaryUrl || `${apiUrl}/api/videos/${video._id}/stream?token=${token}`;
  const badge = statusBadge[video.status] || statusBadge.pending;
  const BadgeIcon = badge.icon;

  const renderPlayer = () => {
    if (video.status === 'safe') {
      return (
        <video controls autoPlay className="w-full aspect-video bg-black" src={streamUrl}>
          Your browser does not support video playback.
        </video>
      );
    }

    if (video.status === 'processing' || video.status === 'pending') {
      return (
        <div className="aspect-video flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-sm">
            <Loader size={64} className="mx-auto text-blue-400 mb-4 animate-spin" />
            <p className="text-xl font-semibold text-white">Processing Video</p>
            <p className="text-gray-400 mt-2 mb-4">{video.processingStage || 'Starting analysis...'}</p>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${video.processingProgress || 0}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{video.processingProgress || 0}% complete</p>
          </div>
        </div>
      );
    }

    return (
      <div className="aspect-video flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <ShieldAlert size={64} className="mx-auto text-red-400 mb-4" />
          <p className="text-xl font-semibold text-white">Content Flagged</p>
          <p className="text-gray-400 mt-2">This video has been flagged during sensitivity analysis and cannot be played.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {renderPlayer()}

        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-white">{video.title}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shrink-0 ${badge.bg} ${badge.color}`}>
              <BadgeIcon size={16} className={video.status === 'processing' ? 'animate-spin' : ''} />
              {badge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <FileVideo size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Format</p>
                <p className="text-sm text-gray-300">{video.mimetype.split('/')[1]?.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HardDrive size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Size</p>
                <p className="text-sm text-gray-300">{formatSize(video.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Uploaded</p>
                <p className="text-sm text-gray-300">{new Date(video.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Uploaded by</p>
              <p className="text-sm text-gray-300">{video.userId?.name || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
