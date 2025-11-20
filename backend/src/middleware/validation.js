export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateUser = (req, res, next) => {
  const { email, password, first_name, last_name } = req.body;
  
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  
  if (!password || !validatePassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  if (!first_name || !last_name) {
    return res.status(400).json({ message: 'First name and last name are required' });
  }
  
  next();
};

export const validateAsset = (req, res, next) => {
  const { name, type, location, status } = req.body;
  
  if (!name || !type || !location || !status) {
    return res.status(400).json({ 
      message: 'Name, type, location, and status are required' 
    });
  }
  
  const validStatuses = ['available', 'rented', 'maintenance'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: 'Status must be one of: available, rented, maintenance' 
    });
  }
  
  next();
};
