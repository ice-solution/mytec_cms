import Category from '../model/Category.js'

const categoryController = {
  getAllCategories: async (req, res) => {
    try {
      let categories;
      if (req.query.all === '1') {
        categories = await Category.find();
      } else {
        categories = await Category.find({ display: true });
      }
      res.json(categories)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id)
      if (!category) return res.status(404).json({ error: 'Category not found' })
      res.json(category)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  createCategory: async (req, res) => {
    try {
      const category = new Category(req.body)
      await category.save()
      res.status(201).json(category)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  updateCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!category) return res.status(404).json({ error: 'Category not found' })
      res.json(category)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id)
      if (!category) return res.status(404).json({ error: 'Category not found' })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

export default categoryController 