const mongoose = require('mongoose');

const SegmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  rules: {
    type: Object,
    required: true,
    // Structure example:
    // {
    //   condition: 'AND',
    //   rules: [
    //     { field: 'totalSpend', operator: '>', value: 10000 },
    //     { field: 'visits', operator: '<', value: 3 }
    //   ]
    // }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estimatedAudience: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to evaluate if a customer matches the segment rules
SegmentSchema.methods.evaluateCustomer = function(customer) {
  const evaluateRule = (rule) => {
    if (rule.condition) {
      // Handle nested conditions (AND/OR)
      const results = rule.rules.map(r => evaluateRule(r));
      return rule.condition === 'AND' 
        ? results.every(r => r)
        : results.some(r => r);
    }

    // Handle leaf rules
    const customerValue = customer[rule.field];
    const ruleValue = rule.value;

    switch (rule.operator) {
      case '>': return customerValue > ruleValue;
      case '<': return customerValue < ruleValue;
      case '>=': return customerValue >= ruleValue;
      case '<=': return customerValue <= ruleValue;
      case '=': return customerValue === ruleValue;
      case '!=': return customerValue !== ruleValue;
      case 'contains': return customerValue.includes(ruleValue);
      case 'not_contains': return !customerValue.includes(ruleValue);
      default: return false;
    }
  };

  return evaluateRule(this.rules);
};

module.exports = mongoose.model('Segment', SegmentSchema); 