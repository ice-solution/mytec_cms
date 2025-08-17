import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: String,
  slug: { 
    type: String, 
    unique: true, 
    required: true 
  },
  display: { type: Boolean, default: true }
})

// 根據 slug 查找分類
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug });
};

const Category = mongoose.model('Category', categorySchema)
export default Category 