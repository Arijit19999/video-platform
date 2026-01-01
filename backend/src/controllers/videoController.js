const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const video = new Video({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.user._id,
      organizationId: req.user.organizationId
    });

    await video.save();

    global.io.emit(`video:${req.user._id}`, {
      type: 'upload_complete',
      videoId: video._id
    });

    processVideo(video._id);

    res.status(201).json({ video });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const baseQuery = {
      organizationId: req.user.organizationId
    };

    
    if (req.user.role === 'viewer') {
      baseQuery.assignedViewers = req.user._id;
    }

    const videos = await Video.find(baseQuery)
      .populate('userId', 'email role')
      .sort({ createdAt: -1 });

    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (
      req.user.role === 'viewer' &&
      !video.assignedViewers.some(
        viewerId => viewerId.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({ error: 'Access denied (not assigned)' });
    }

    const videoPath = video.filepath;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimetype,
      });
      
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': video.mimetype,
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function processVideo(videoId) {
  const video = await Video.findById(videoId);
  
  global.io.emit(`video:${video.userId}`, {
    type: 'processing_started',
    videoId: video._id,
    progress: 0
  });

  video.processingStatus = 'processing';
  await video.save();

  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    video.processingProgress = i;
    await video.save();
    
    global.io.emit(`video:${video.userId}`, {
      type: 'processing_progress',
      videoId: video._id,
      progress: i
    });
  }

  const sensitivityScore = Math.random();
  video.sensitivityStatus = sensitivityScore > 0.7 ? 'flagged' : 'safe';
  video.processingStatus = 'completed';
  video.processingProgress = 100;
  await video.save();

  global.io.emit(`video:${video.userId}`, {
    type: 'processing_complete',
    videoId: video._id,
    sensitivityStatus: video.sensitivityStatus
  });
}

exports.assignViewers = async (req, res) => {
  try {
    const { viewerIds } = req.body; 
    const videoId = req.params.id;

    if (!Array.isArray(viewerIds) || viewerIds.length === 0) {
      return res.status(400).json({ error: 'viewerIds must be a non-empty array' });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Organization safety
    if (video.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Cross-organization access denied' });
    }

    // Assign viewers (no duplicates)
    video.assignedViewers = [
      ...new Set([...video.assignedViewers, ...viewerIds])
    ];

    await video.save();

    res.json({
      message: 'Viewers assigned successfully',
      assignedViewers: video.assignedViewers
    });
  } catch (error) {
    console.error('Assign viewers error:', error);
    res.status(500).json({ error: 'Failed to assign viewers' });
  }
};
