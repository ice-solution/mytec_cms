import jwt from 'jsonwebtoken';
import User from '../model/User.js';

// 檢查用戶是否為管理員
export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供認證令牌' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'mytec_secret');
    const user = await User.findById(payload.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理員權限' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '無效的認證令牌' });
  }
};

// 檢查用戶是否為教練或管理員
export const requireCoachOrAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供認證令牌' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'mytec_secret');
    const user = await User.findById(payload.id);
    
    if (!user || (user.role !== 'coach' && user.role !== 'admin')) {
      return res.status(403).json({ message: '需要教練或管理員權限' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '無效的認證令牌' });
  }
};

// 檢查用戶是否已登入（任何角色）
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供認證令牌' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'mytec_secret');
    const user = await User.findById(payload.id);
    
    if (!user) {
      return res.status(401).json({ message: '用戶不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '無效的認證令牌' });
  }
};

// 檢查角色轉換權限
export const canChangeRole = async (req, res, next) => {
  try {
    const { targetUserId, newRole } = req.body;
    const currentUser = req.user;

    // 只有管理員可以轉換角色
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ 
        message: '只有管理員可以修改用戶角色' 
      });
    }

    // 檢查目標用戶是否存在
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: '目標用戶不存在' });
    }

    // 檢查新角色是否有效
    const validRoles = ['member', 'coach', 'admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ 
        message: '無效的角色，只允許: member, coach, admin' 
      });
    }

    // 防止管理員修改自己的角色
    if (targetUserId === currentUser._id.toString()) {
      return res.status(400).json({ 
        message: '不能修改自己的角色' 
      });
    }

    req.targetUser = targetUser;
    next();
  } catch (error) {
    res.status(500).json({ message: '角色轉換權限檢查失敗' });
  }
};
