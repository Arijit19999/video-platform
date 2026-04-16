import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Video from "../models/Video.js";
import config from "../config/index.js";

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

const reprocess = async () => {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  const videos = await Video.find({});
  console.log(`Found ${videos.length} videos to reprocess\n`);

  for (const video of videos) {
    const title = video.title.toLowerCase();
    const isFlagged = FLAGGED_KEYWORDS.some((keyword) =>
      title.includes(keyword),
    );
    const newStatus = isFlagged ? "flagged" : "safe";

    await Video.findByIdAndUpdate(video._id, {
      status: newStatus,
      processingProgress: 100,
      processingStage: "Complete",
    });

    console.log(`"${video.title}" → ${newStatus}`);
  }

  console.log("\nDone! Refresh your browser.");
  process.exit(0);
};

reprocess();
