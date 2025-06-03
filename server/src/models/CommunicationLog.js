const mongoose = require('mongoose');

const CommunicationLogSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'failed'],
    default: 'queued'
  },
  vendorMessageId: String,
  errorDetails: String,
  metadata: {
    type: Map,
    of: String
  },
  sentAt: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
CommunicationLogSchema.index({ campaign: 1, customer: 1 });
CommunicationLogSchema.index({ status: 1, campaign: 1 });
CommunicationLogSchema.index({ vendorMessageId: 1 });

// Update campaign stats on status change
CommunicationLogSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    const Campaign = mongoose.model('Campaign');
    const updateQuery = {};
    
    if (this.status === 'sent') {
      updateQuery.$inc = { 'stats.sent': 1 };
    } else if (this.status === 'delivered') {
      updateQuery.$inc = { 'stats.delivered': 1 };
    } else if (this.status === 'failed') {
      updateQuery.$inc = { 'stats.failed': 1 };
    }

    if (Object.keys(updateQuery).length > 0) {
      await Campaign.findByIdAndUpdate(this.campaign, updateQuery);
    }
  }
  next();
});

module.exports = mongoose.model('CommunicationLog', CommunicationLogSchema); 