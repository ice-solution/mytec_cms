import express from 'express'
import categoryController from '../controllers/categoryController.js'
import { requireAuth, requireAdmin } from '../middleware/roleAuth.js'

const router = express.Router()

// GET 方法不需要認證，其他方法需要管理員權限
router.get('/', categoryController.getAllCategories)
router.get('/:id', categoryController.getCategoryById)

// 只有管理員可以修改分類
router.post('/', requireAdmin, categoryController.createCategory)
router.put('/:id', requireAdmin, categoryController.updateCategory)
router.delete('/:id', requireAdmin, categoryController.deleteCategory)

export default router 