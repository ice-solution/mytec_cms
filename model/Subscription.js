import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  status: { 
    type: String, 
    enum: ['active', 'unsubscribed', 'bounced'], 
    default: 'active' 
  },
  source: { 
    type: String, 
    enum: ['website', 'admin', 'api'], 
    default: 'website' 
  },
  subscribed_at: { 
    type: Date, 
    default: Date.now 
  },
  unsubscribed_at: { 
    type: Date 
  },
  last_email_sent: { 
    type: Date 
  },
  tags: [{ 
    type: String 
  }],
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  modified_at: { 
    type: Date, 
    default: Date.now 
  }
});

// 更新時間戳
subscriptionSchema.pre('save', function(next) {
  this.modified_at = new Date();
  next();
});

subscriptionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ modified_at: new Date() });
  next();
});

// 索引
subscriptionSchema.index({ email: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ subscribed_at: -1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
