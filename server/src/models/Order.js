const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update customer stats on order creation
OrderSchema.post('save', async function(doc) {
  const Customer = mongoose.model('Customer');
  await Customer.findByIdAndUpdate(doc.customer, {
    $inc: { 
      totalSpend: doc.amount,
      visits: 1
    },
    lastVisit: doc.createdAt
  });
});

module.exports = mongoose.model('Order', OrderSchema);