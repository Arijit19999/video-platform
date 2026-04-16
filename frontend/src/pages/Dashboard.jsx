import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import VideoCard from '../components/VideoCard';
import { StatSkeleton, VideoGridSkeleton } from '../components/Skeletons';
import toast from 'react-hot-toast';
import { Film, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState({});

  const fetchVideos = useCallback(async () => {
    try {
      const res = await api.get('/videos');
      setVideos(res.data.videos);
    } catch (err) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

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
      setProgressMap((prev) => {
        const updated = { ...prev };
        delete updated[data.videoId];
        return updated;
      });
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId ? { ...v, status: data.status, processingProgress: 100, processingStage: 'Complete' } : v
        )
      );
      toast.success(`Video processed: ${data.status === 'safe' ? 'Safe' : 'Flagged'}`);
    },
    onError: (data) => {
      toast.error('Processing failed for a video');
      fetchVideos();
    },
  });

  const counts = {
    total: videos.length,
    safe: videos.filter((v) => v.status === 'safe').length,
    flagged: videos.filter((v) => v.status === 'flagged').length,
    processing: videos.filter((v) => v.status === 'processing' || v.status === 'pending').length,
  };

  const recentVideos = [...videos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 bg-gray-700 rounded w-64 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-80 mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <VideoGridSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}</h1>
        <p className="text-gray-400 mt-1">Here's what's happening with your videos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Videos', value: counts.total, icon: Film, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Safe', value: counts.safe, icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Flagged', value: counts.flagged, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Processing', value: counts.processing, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Videos</h2>
        {recentVideos.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <Film size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No videos yet. Upload your first video to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVideos.map((video) => (
              <VideoCard key={video._id} video={video} progress={progressMap[video._id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
