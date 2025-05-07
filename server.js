const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route placeholders for products and users
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'Basketball', price: 29.99 },
    { id: 2, name: 'Soccer Ball', price: 24.99 }
  ]);
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Jane Doe', email: 'jane@example.com' }
  ]);
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
