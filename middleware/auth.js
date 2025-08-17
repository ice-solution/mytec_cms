import jwt from 'jsonwebtoken'

const auth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = auth.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'mytec_secret')
    
    req.user = payload
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(401).json({ error: 'Invalid token' })
  }
}

export default auth
