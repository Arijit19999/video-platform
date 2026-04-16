import { Router } from 'express';
import { uploadVideo, getVideos, getVideo, deleteVideo, streamVideo } from '../controllers/videoController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { verifyStreamToken } from '../middleware/streamAuth.js';
import upload from '../middleware/upload.js';

const router = Router();

let uploadMiddleware = upload.single('video');

if (process.env.STORAGE_TYPE === 'cloudinary') {
  const { cloudinaryUpload } = await import('../middleware/cloudinaryUpload.js');
  uploadMiddleware = cloudinaryUpload.single('video');
}

router.get('/:id/stream', verifyStreamToken, streamVideo);

router.use(verifyToken);

router.post('/upload', requireRole('editor', 'admin'), uploadMiddleware, uploadVideo);
router.get('/', getVideos);
router.get('/:id', getVideo);
router.delete('/:id', requireRole('editor', 'admin'), deleteVideo);

export default router;
