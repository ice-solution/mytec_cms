import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const authController = {
  // 登入
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // 查找用戶
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // 檢查密碼
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // 檢查角色權限 - 只允許 admin 和 coach 登入後台
      if (user.role !== 'admin' && user.role !== 'coach') {
        return res.status(403).json({ error: 'Access denied. Only admin and coach can access the backend.' });
      }

      // 生成 JWT token
      const token = jwt.sign(
        { 
          id: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'mytec_secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 驗證 token
  verifyToken: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mytec_secret');

      // 查找用戶
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // 檢查角色 - 只允許 admin 和 coach
      if (user.role !== 'admin' && user.role !== 'coach') {
        return res.status(403).json({ error: 'Access denied. Only admin and coach can access the backend.' });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  // 登出
  logout: async (req, res) => {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  },

  // 獲取當前用戶資訊
  getCurrentUser: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mytec_secret');

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (err) {
      console.error('Get current user error:', err);
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  // 重置密碼
  resetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required' });
      }

      // 查找用戶
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 加密新密碼
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // 更新密碼
      user.password = hashedPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 檢查用戶是否存在（用於重置密碼前的驗證）
  checkUserExists: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      
      res.json({
        exists: !!user,
        message: user ? 'User found' : 'User not found'
      });
    } catch (err) {
      console.error('Check user error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

export default authController;
