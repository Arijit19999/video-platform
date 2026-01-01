import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

export default function VideoUpload({ onUploadComplete }) {
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // RBAC: viewers cannot upload videos
  if (user?.role === 'viewer') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title || file.name);

    try {
      await api.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });

      // reset UI state
      setFile(null);
      setTitle('');
      setProgress(0);

      // notify parent to refresh video list
      onUploadComplete?.();

    } catch (err) {
      console.error('Upload failed:', err);
      setError(
        err.response?.data?.error || 'Video upload failed'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Video</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Video title (optional)"
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="file"
            accept="video/*"
            disabled={uploading}
            onChange={(e) => setFile(e.target.files[0])}
            className="flex-1 border rounded-md px-3 py-2"
          />

          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? `Uploading ${progress}%` : 'Upload'}
          </button>
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );

}
