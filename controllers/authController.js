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

      // 檢查角色權限
      if (user.role !== 'admin' && user.role !== 'organizer') {
        return res.status(403).json({ error: 'Access denied. Admin or Organizer role required.' });
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

      // 檢查角色
      if (user.role !== 'admin' && user.role !== 'organizer') {
        return res.status(403).json({ error: 'Access denied. Admin or Organizer role required.' });
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
  }
};

export default authController;
