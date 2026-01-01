import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AssignViewersModal({ videoId, onClose }) {
  const [viewers, setViewers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchViewers = async () => {
      const { data } = await api.get('/users?role=viewer');
      setViewers(data.users);
    };
    fetchViewers();
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id]
    );
  };

  const assign = async () => {
    setLoading(true);
    try {
      await api.put(`/videos/${videoId}/assign-viewers`, {
        viewerIds: selected,
      });
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Assign failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Assign Viewers</h3>

        {viewers.map((v) => (
          <label key={v._id}>
            <input
              type="checkbox"
              onChange={() => toggle(v._id)}
            />
            {v.email}
          </label>
        ))}

        <div className="actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={assign} disabled={loading}>
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
