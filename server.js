require('dotenv').config();

const express = require('express');
const cors = require('cors');

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

// Define products
const products = [
  { id: 1, name: 'Basketball', price: 29.99 },
  { id: 2, name: 'Soccer Ball', price: 24.99 },
  { id: 3, name: 'Tennis Racket', price: 59.99 },
  { id: 4, name: 'Running Shoes', price: 89.99 },
  { id: 5, name: 'Yoga Mat', price: 19.99 },
  { id: 6, name: 'Baseball Glove', price: 39.99 },
  { id: 7, name: 'Water Bottle', price: 9.99 },
  { id: 8, name: 'Dumbbell Set', price: 79.99 }
];

// Make available to all routes
app.locals.products = products;

// Route placeholders
app.get('/api/products', (req, res) => {
  res.json(app.locals.products);
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
    { id: 2, name: 'John Smith', email: 'john@example.com' },
    { id: 3, name: 'Lisa Ray', email: 'lisa@example.com' },
    { id: 4, name: 'Carlos Gomez', email: 'carlos@example.com' },
    { id: 5, name: 'Fatima Ali', email: 'fatima@example.com' }
  ]);
});


app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
