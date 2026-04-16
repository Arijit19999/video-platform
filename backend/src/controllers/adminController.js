import User from '../models/User.js';
import Video from '../models/Video.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ orgId: req.user.orgId }).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, orgId: req.user.orgId },
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update role.', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself.' });
    }

    const user = await User.findOneAndDelete({ _id: req.params.id, orgId: req.user.orgId });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await Video.deleteMany({ userId: req.params.id });

    res.json({ message: 'User and their videos deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalVideos, statusCounts] = await Promise.all([
      User.countDocuments({ orgId: req.user.orgId }),
      Video.countDocuments({ orgId: req.user.orgId }),
      Video.aggregate([
        { $match: { orgId: req.user.orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const stats = { totalUsers, totalVideos, byStatus: {} };
    statusCounts.forEach((s) => {
      stats.byStatus[s._id] = s.count;
    });

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: error.message });
  }
};
