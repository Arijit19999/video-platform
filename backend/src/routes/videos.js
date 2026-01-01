const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const videoController = require('../controllers/videoController');
const { authenticate, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|avi|mov|wmv|mkv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only video files are allowed.'));
  }
});

router.post('/', authenticate, authorize('editor', 'admin'), upload.single('video'), videoController.uploadVideo);
router.get('/', authenticate, videoController.getVideos);
router.get('/:id/stream', authenticate, videoController.streamVideo);
router.put(
  '/:id/assign-viewers',
  authenticate,
  authorize('editor', 'admin'),
  videoController.assignViewers
);

module.exports = router;