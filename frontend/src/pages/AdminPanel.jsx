import { useState, useEffect } from 'react';
import api from '../services/api';
import { StatSkeleton, TableRowSkeleton } from '../components/Skeletons';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import { Users, Film, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats'),
        ]);
        setUsers(usersRes.data.users);
        setStats(statsRes.data.stats);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data.user : u)));
      toast.success('Role updated');
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = (userId) => {
    setDeleteTarget(userId);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/users/${deleteTarget}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="h-6 bg-gray-700 rounded w-40 animate-pulse" />
          </div>
          <table className="w-full">
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Admin Panel</h1>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-400/10"><Users size={24} className="text-purple-400" /></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Videos</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalVideos}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-400/10"><Film size={24} className="text-blue-400" /></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Safe Videos</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.byStatus?.safe || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-400/10"><ShieldCheck size={24} className="text-green-400" /></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Flagged Videos</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.byStatus?.flagged || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-400/10"><ShieldAlert size={24} className="text-red-400" /></div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User"
        message="This will permanently delete the user and all their uploaded videos. This action cannot be undone."
        confirmLabel="Delete User"
        danger
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminPanel;
