const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'paused'],
    default: 'draft'
  },
  segmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment',
    required: true
  },
  content: {
    subject: String,
    body: {
      type: String,
      required: true
    },
    template: String,
    attachments: [String]
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly']
    },
    timezone: String
  },
  metrics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    },
    complained: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes
campaignSchema.index({ name: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ 'schedule.startDate': 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign; 