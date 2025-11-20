import jwt from 'jsonwebtoken';
import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'is_active')
      .where('id', decoded.sub)
      .where('is_active', true)
      .first();

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      ...user,
      sub: user.id
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
