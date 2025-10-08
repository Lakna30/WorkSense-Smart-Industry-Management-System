import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    // Demo only: Replace with DB lookup
    if (email !== 'admin@example.com') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, await bcrypt.hash('admin', 10));
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: '1', email }, process.env.JWT_SECRET || 'change_me', {
      expiresIn: '1d'
    });
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}

export async function register(req, res, next) {
  try {
    // Placeholder: normally create user in DB
    return res.status(201).json({ message: 'Registered (placeholder)' });
  } catch (err) {
    return next(err);
  }
}


