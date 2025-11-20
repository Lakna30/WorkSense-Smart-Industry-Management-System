import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Find user in database
    const user = await db('users')
      .select('*')
      .where('email', email)
      .where('is_active', true)
      .first();
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    await db('users')
      .where('id', user.id)
      .update({ last_login: new Date() });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id, 
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Check if user already exists
    const existingUser = await db('users')
      .where('email', email)
      .first();
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const [newUser] = await db('users')
      .insert({
        email,
        password_hash,
        first_name,
        last_name,
        role: 'user'
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'role']);
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: newUser
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.sub;
    
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'last_login', 'created_at')
      .where('id', userId)
      .where('is_active', true)
      .first();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.sub;
    const { first_name, last_name, email } = req.body;
    
    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await db('users')
        .select('id')
        .where('email', email)
        .where('id', '!=', userId)
        .first();
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Update user profile
    const updatedUser = await db('users')
      .where('id', userId)
      .update({
        first_name: first_name || null,
        last_name: last_name || null,
        email: email || null,
        updated_at: new Date()
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'last_login', 'created_at']);
    
    if (!updatedUser.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


