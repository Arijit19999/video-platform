import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'safe', 'flagged'],
    default: 'pending',
  },
  processingProgress: {
    type: Number,
    default: 0,
  },
  processingStage: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orgId: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  cloudinaryUrl: {
    type: String,
    default: '',
  },
  cloudinaryId: {
    type: String,
    default: '',
  },
}, { timestamps: true });

videoSchema.index({ userId: 1, status: 1 });
videoSchema.index({ orgId: 1 });

export default mongoose.model('Video', videoSchema);
