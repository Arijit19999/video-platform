export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }
  if (name && name.length > 50) {
    errors.push('Name must not exceed 50 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
  if (password && password.length > 128) {
    errors.push('Password must not exceed 128 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  next();
};

export const validateVideoUpload = (req, res, next) => {
  const { title } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Video title is required.' });
  }
  if (title.length > 200) {
    return res.status(400).json({ message: 'Title must not exceed 200 characters.' });
  }

  next();
};

export const validateRole = (req, res, next) => {
  const { role } = req.body;
  const validRoles = ['viewer', 'editor', 'admin'];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
  }

  next();
};
