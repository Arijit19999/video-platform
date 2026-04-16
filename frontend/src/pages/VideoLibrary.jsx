import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import VideoCard from '../components/VideoCard';
import ConfirmModal from '../components/ConfirmModal';
import { VideoGridSkeleton } from '../components/Skeletons';
import toast from 'react-hot-toast';
import { Search, SlidersHorizontal, Film } from 'lucide-react';

const VideoLibrary = () => {
  const { canUpload } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [progressMap, setProgressMap] = useState({});

  const fetchVideos = useCallback(async () => {
    try {
      const params = { sortBy, order };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/videos', { params });
      setVideos(res.data.videos);
    } catch (err) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, order, search]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  useSocket({
    onProgress: (data) => {
      setProgressMap((prev) => ({ ...prev, [data.videoId]: data.progress }));
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId ? { ...v, processingProgress: data.progress, processingStage: data.stage, status: 'processing' } : v
        )
      );
    },
    onComplete: (data) => {
      setProgressMap((prev) => { const u = { ...prev }; delete u[data.videoId]; return u; });
      setVideos((prev) =>
        prev.map((v) => v._id === data.videoId ? { ...v, status: data.status, processingProgress: 100 } : v)
      );
    },
  });

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/videos/${deleteTarget}`);
      setVideos((prev) => prev.filter((v) => v._id !== deleteTarget));
      toast.success('Video deleted');
    } catch (err) {
      toast.error('Failed to delete video');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-10 bg-gray-700 rounded-lg flex-1 animate-pulse" />
          <div className="h-10 bg-gray-700 rounded-lg w-36 animate-pulse" />
          <div className="h-10 bg-gray-700 rounded-lg w-36 animate-pulse" />
        </div>
        <VideoGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Video Library</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="safe">Safe</option>
          <option value="flagged">Flagged</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
        </select>
        <select value={`${sortBy}-${order}`} onChange={(e) => { const [s, o] = e.target.value.split('-'); setSortBy(s); setOrder(o); }} className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="size-desc">Largest</option>
          <option value="size-asc">Smallest</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
        </select>
      </div>

      {videos.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <Film size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">{search || statusFilter !== 'all' ? 'No videos match your filters' : 'No videos yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} onDelete={canUpload ? handleDelete : undefined} progress={progressMap[video._id]} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Video"
        message="This will permanently delete the video and its file. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default VideoLibrary;
