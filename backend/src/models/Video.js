const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  size: { type: Number, required: true },
  duration: Number,
  mimetype: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedViewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  organizationId: { type: String, required: true },
  processingStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  sensitivityStatus: { 
    type: String, 
    enum: ['safe', 'flagged', 'unknown'], 
    default: 'unknown' 
  },
  
  processingProgress: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);