require('dotenv').config();

const express = require('express');
const cors = require('cors');
const client = require('./db/client');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// userRoutes
const userRoutes = require('./routes/users');
app.use('/api/auth', userRoutes);

// cartRoutes
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes)

// API routes
app.get('/api/products', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);  
  } catch (err) {
    console.error('Error fetching products:', err);  
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// app.get('/api/users', (req, res) => {
//   res.json([
//     { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
//     { id: 2, name: 'John Smith', email: 'john@example.com' },
//     { id: 3, name: 'Lisa Ray', email: 'lisa@example.com' },
//     { id: 4, name: 'Carlos Gomez', email: 'carlos@example.com' },
//     { id: 5, name: 'Fatima Ali', email: 'fatima@example.com' }
//   ]);
// });


// Start server and connect to DB
app.listen(PORT, async () => {
  try {
    await client.connect();
    console.log('Connected to the database');
  } catch (err) {
    console.error('Failed to connect to the database', err);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
