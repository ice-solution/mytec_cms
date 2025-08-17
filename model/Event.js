import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  category: String,
  image: String,
  mimeType: String, // 新增此欄位
  description: String,
  cost: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event_img: String, // 新增 event_img 欄位
  
  // SEO 相關欄位
  slug: { 
    type: String, 
    unique: true, 
    required: true 
  },
  meta_title: { 
    type: String, 
    default: function() { return this.title; } 
  },
  meta_description: { 
    type: String, 
    default: function() { return this.description ? this.description.substring(0, 160) : ''; } 
  },
  meta_keywords: String,
  og_image: String,
  
  created_at: { type: Date, default: Date.now },
  modified_at: { type: Date, default: Date.now }
})

// 更新時間戳
eventSchema.pre('save', function(next) {
  this.modified_at = new Date();
  
  // 如果沒有設定 meta_title，使用標題
  if (!this.meta_title) {
    this.meta_title = this.title;
  }
  
  // 如果沒有設定 meta_description，使用描述的前160字
  if (!this.meta_description && this.description) {
    this.meta_description = this.description.substring(0, 160);
  }
  
  next();
});

eventSchema.pre('findOneAndUpdate', function(next) {
  this.set({ modified_at: new Date() });
  next();
});

// 根據 slug 查找事件
eventSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug });
};

const Event = mongoose.model('Event', eventSchema)
export default Event 