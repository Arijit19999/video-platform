import fs from "fs";
import path from "path";
import Video from "../models/Video.js";
import config from "../config/index.js";
import { processVideo } from "../services/processingService.js";

const isCloudinary = process.env.STORAGE_TYPE === "cloudinary";

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file provided." });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Video title is required." });
    }

    const videoData = {
      title,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      userId: req.user._id,
      orgId: req.user.orgId,
      status: "pending",
    };

    if (isCloudinary) {
      videoData.filename = req.file.filename || req.file.public_id;
      videoData.cloudinaryUrl = req.file.path;
      videoData.cloudinaryId = req.file.filename || req.file.public_id;
    } else {
      videoData.filename = req.file.filename;
    }

    const video = await Video.create(videoData);

    if (process.env.NODE_ENV !== "test") {
      const io = req.app.get("io");
      processVideo(video, io);
    }

    res.status(201).json({ video });
  } catch (error) {
    res.status(500).json({ message: "Upload failed.", error: error.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    const { status, search, sortBy, order } = req.query;
    const filter = {};

    if (req.user.role === "admin") {
      filter.orgId = req.user.orgId;
    } else if (req.user.role === "viewer") {
      filter.orgId = req.user.orgId;
      filter.status = "safe";
    } else {
      filter.userId = req.user._id;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const sortOptions = {};
    sortOptions[sortBy || "createdAt"] = order === "asc" ? 1 : -1;

    const videos = await Video.find(filter)
      .populate("userId", "name email")
      .sort(sortOptions);

    res.json({ videos });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch videos.", error: error.message });
  }
};

export const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    const isOwner = video.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin" && video.orgId === req.user.orgId;
    const isViewerWithAccess =
      req.user.role === "viewer" &&
      video.orgId === req.user.orgId &&
      video.status === "safe";

    if (!isOwner && !isAdmin && !isViewerWithAccess) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json({ video });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch video.", error: error.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    if (
      req.user.role !== "admin" &&
      video.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (isCloudinary && video.cloudinaryId) {
      const { cloudinary } = await import("../middleware/cloudinaryUpload.js");
      await cloudinary.uploader.destroy(video.cloudinaryId, {
        resource_type: "video",
      });
    } else {
      const filePath = path.join(config.uploadDir, video.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: "Video deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete video.", error: error.message });
  }
};

export const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    if (
      req.user.role !== "admin" &&
      video.userId.toString() !== req.user._id.toString()
    ) {
      const isViewerWithAccess =
        req.user.role === "viewer" &&
        video.orgId === req.user.orgId &&
        video.status === "safe";
      if (!isViewerWithAccess) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    if (isCloudinary && video.cloudinaryUrl) {
      return res.redirect(video.cloudinaryUrl);
    }

    const filePath = path.join(config.uploadDir, video.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Video file not found on disk." });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      if (start >= fileSize) {
        return res
          .status(416)
          .json({ message: "Requested range not satisfiable." });
      }

      const stream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": video.mimetype,
      });

      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": video.mimetype,
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Streaming failed.", error: error.message });
  }
};
