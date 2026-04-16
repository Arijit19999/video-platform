import { Play, Trash2, Clock, ShieldCheck, ShieldAlert, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending' },
  processing: { icon: Loader, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Processing' },
  safe: { icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Safe' },
  flagged: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Flagged' },
};

const formatSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const VideoCard = ({ video, onDelete, progress }) => {
  const navigate = useNavigate();
  const status = statusConfig[video.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isProcessing = video.status === 'processing' || progress !== undefined;
  const currentProgress = progress ?? video.processingProgress ?? 0;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
        {video.status === 'safe' ? (
          <button onClick={() => navigate(`/videos/${video._id}`)} className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group">
            <Play size={48} className="text-white opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <div className={`flex flex-col items-center gap-2 ${status.color}`}>
            <StatusIcon size={32} className={isProcessing ? 'animate-spin' : ''} />
            <span className="text-sm">{status.label}</span>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="px-4 pt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{video.processingStage || 'Processing...'}</span>
            <span>{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${currentProgress}%` }} />
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{video.title}</h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{formatSize(video.size)}</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
            <StatusIcon size={12} className={isProcessing ? 'animate-spin' : ''} />
            {status.label}
          </span>
          {onDelete && (
            <button onClick={() => onDelete(video._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
