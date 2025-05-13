const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const users = []; 
const SECRET = process.env.JWT_SECRET;

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, email, password: hashed };

  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email }, SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: newUser.id, email } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, email }, SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, email } });

});

module.exports = router;
