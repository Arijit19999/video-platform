import Video from "../models/Video.js";

const STAGES = [
  { name: "Validating file format", progress: 10, duration: 1500 },
  { name: "Extracting video frames", progress: 30, duration: 2000 },
  { name: "Analyzing content patterns", progress: 50, duration: 2500 },
  { name: "Running sensitivity classifier", progress: 75, duration: 2000 },
  { name: "Generating report", progress: 90, duration: 1500 },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const FLAGGED_KEYWORDS = [
  "violent",
  "violence",
  "explicit",
  "nsfw",
  "adult",
  "gore",
  "harmful",
  "unsafe",
  "restricted",
  "inappropriate",
  "offensive",
  "abuse",
];

const determineSensitivity = (video) => {
  const title = video.title.toLowerCase();
  const isFlagged = FLAGGED_KEYWORDS.some((keyword) => title.includes(keyword));
  return isFlagged ? "flagged" : "safe";
};

export const processVideo = async (video, io) => {
  try {
    await Video.findByIdAndUpdate(video._id, {
      status: "processing",
      processingProgress: 0,
      processingStage: "Starting analysis...",
    });

    io.to(video.userId.toString()).emit("processing:start", {
      videoId: video._id,
      status: "processing",
    });

    for (const stage of STAGES) {
      await delay(stage.duration);

      await Video.findByIdAndUpdate(video._id, {
        processingProgress: stage.progress,
        processingStage: stage.name,
      });

      io.to(video.userId.toString()).emit("processing:progress", {
        videoId: video._id,
        progress: stage.progress,
        stage: stage.name,
      });
    }

    const result = determineSensitivity(video);

    await Video.findByIdAndUpdate(video._id, {
      status: result,
      processingProgress: 100,
      processingStage: "Complete",
    });

    io.to(video.userId.toString()).emit("processing:complete", {
      videoId: video._id,
      status: result,
      progress: 100,
    });
  } catch (error) {
    await Video.findByIdAndUpdate(video._id, {
      status: "flagged",
      processingStage: "Error during processing",
    });

    io.to(video.userId.toString()).emit("processing:error", {
      videoId: video._id,
      error: error.message,
    });
  }
};
