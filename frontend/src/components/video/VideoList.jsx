import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import AssignViewersModal from './AssignViewersModal';

export default function VideoList({ refresh }) {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [assignVideoId, setAssignVideoId] = useState(null);

  const socket = useSocket();
  const { user } = useAuth();

  const fetchVideos = async () => {
    const params = filter !== 'all' ? { status: filter } : {};
    const response = await api.get('/videos', { params });
    setVideos(response.data.videos);
  };

  useEffect(() => {
    fetchVideos();
  }, [refresh, filter]);

  
  useEffect(() => {
    if (!socket || !user) return;

    const eventName = `video:${user.id}`;

    socket.on(eventName, (data) => {
      setVideos((prev) =>
        prev.map((video) => {
          if (video._id !== data.videoId) return video;

          return {
            ...video,
            processingProgress:
              data.progress ?? video.processingProgress,
            processingStatus: data.type.includes('complete')
              ? 'completed'
              : 'processing',
            sensitivityStatus:
              data.sensitivityStatus ?? video.sensitivityStatus,
          };
        })
      );
    });

    return () => socket.off(eventName);
  }, [socket, user]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {['all', 'safe', 'flagged'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* VIDEO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video._id}
            className="bg-white rounded-lg shadow p-4 space-y-2"
          >
            <h3 className="font-medium">{video.title}</h3>

            <p className="text-sm text-gray-600">
              Status: {video.processingStatus}
            </p>

            {video.processingStatus === 'processing' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${video.processingProgress}%` }}
                />
              </div>
            )}

            {/* {video.processingStatus === 'completed' && (
              <>
                <p className="text-sm">
                  Sensitivity:{' '}
                  <span
                    className={
                      video.sensitivityStatus === 'safe'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {video.sensitivityStatus}
                  </span>
                </p>

                <p className="text-sm font-semibold text-gray-700">
                  ▶ Stream Video
                </p>

                <video
                  controls
                  preload="metadata"
                  className="w-full rounded-md"
                  src={`http://localhost:5000/api/videos/${video._id}/stream`}
                />
              </>
            )} */}

            {video.processingStatus === 'completed' && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  ▶ Stream Video
                </p>

                <div className="relative w-full">
                  <video
                    controls
                    preload="metadata"
                    className="w-full h-56 rounded-md border bg-black cursor-pointer pointer-events-auto"
                    // src={`http://localhost:5000/api/videos/${video._id}/stream`}
                    src={`/api/videos/${video._id}/stream`}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Click play to stream the video
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

}
