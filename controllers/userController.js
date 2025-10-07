import User from '../model/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const DEFAULT_AVATAR = '/uploads/default/avatars.png';
const JWT_SECRET = process.env.JWT_SECRET || 'mytec_secret';

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find()
      res.json(users)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
      if (!user) return res.status(404).json({ error: 'User not found' })
      res.json(user)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  createUser: async (req, res) => {
    try {
      const data = { ...req.body }
      if (!data.avatar) data.avatar = DEFAULT_AVATAR;
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10)
      }
      const user = new User(data)
      await user.save()
      res.status(201).json(user)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  updateUser: async (req, res) => {
    try {
      const data = { ...req.body }
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10)
      }
      const user = await User.findByIdAndUpdate(req.params.id, data, { new: true })
      if (!user) return res.status(404).json({ error: 'User not found' })
      res.json(user)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
      if (!user) return res.status(404).json({ error: 'User not found' })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  registerUser: async (req, res) => {
    try {
      const { first_name, last_name, email, password, avatar, birth, country_code, phone, gender } = req.body;
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const exist = await User.findOne({ email });
      if (exist) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      const hash = await bcrypt.hash(password, 10);
      const user = new User({
        first_name,
        last_name,
        email,
        password: hash,
        avatar: avatar || DEFAULT_AVATAR,
        birth,
        country_code,
        phone,
        gender
      });
      await user.save();
      res.status(201).json({
        message: 'Register success',
        user: {
          first_name,
          last_name,
          email,
          _id: user._id,
          avatar: user.avatar,
          birth,
          country_code,
          phone,
          gender
        }
      });
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  loginUser: async (req, res) => {
    try {
      const { country_code, phone, password } = req.body;
      if (!country_code || !phone || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const user = await User.findOne({ country_code, phone });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: 'Invalid password' });
      }
      const token = jwt.sign({ id: user._id, phone: user.phone, country_code: user.country_code }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        message: 'Login success',
        token,
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          country_code: user.country_code,
          phone: user.phone,
          email: user.email,
          gender: user.gender,
          birth: user.birth,
          avatar: user.avatar
        }
      });
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  getProfile: async (req, res) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const token = auth.replace('Bearer ', '');
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const user = await User.findById(payload.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        country_code: user.country_code,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        birth: user.birth,
        avatar: user.avatar
      });
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  addFavourite: async (req, res) => {
    try {
      const { userId } = req.body; // 可從 JWT 取 id，這裡簡化
      const { event_id } = req.params;
      if (!userId || !event_id) return res.status(400).json({ error: 'Missing userId or event_id' });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (!user.userFavourites.includes(event_id)) {
        user.userFavourites.push(event_id);
        await user.save();
      }
      res.json({ message: 'Added to favourites', userFavourites: user.userFavourites });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  removeFavourite: async (req, res) => {
    try {
      const { userId } = req.body; // 可從 JWT 取 id，這裡簡化
      const { event_id } = req.params;
      if (!userId || !event_id) return res.status(400).json({ error: 'Missing userId or event_id' });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.userFavourites = user.userFavourites.filter(eid => eid.toString() !== event_id);
      await user.save();
      res.json({ message: 'Removed from favourites', userFavourites: user.userFavourites });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 登出
  logoutUser: async (req, res) => {
    // 若用 httpOnly cookie，這裡可 res.clearCookie('token')
    // 這裡回傳訊息，前端收到後自行清除 localStorage/sessionStorage 的 JWT
    res.json({ message: 'Logout success, token removed on client.' });
  },

  // 獲取所有用戶（僅管理員）
  getAllUsersWithRoles: async (req, res) => {
    try {
      const users = await User.find({}, { password: 0 }).sort({ role: 1, first_name: 1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 修改用戶角色（僅管理員）
  changeUserRole: async (req, res) => {
    try {
      const { targetUserId, newRole } = req.body;
      const currentUser = req.user;

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

      // 更新用戶角色
      targetUser.role = newRole;
      await targetUser.save();

      res.json({ 
        message: '用戶角色更新成功',
        user: {
          _id: targetUser._id,
          first_name: targetUser.first_name,
          last_name: targetUser.last_name,
          email: targetUser.email,
          role: targetUser.role
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 獲取用戶角色統計
  getRoleStats: async (req, res) => {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const roleStats = {
        total: await User.countDocuments(),
        member: 0,
        coach: 0,
        admin: 0
      };

      stats.forEach(stat => {
        roleStats[stat._id] = stat.count;
      });

      res.json(roleStats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default userController 