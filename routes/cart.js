const client = require('../db/client');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

// Middleware to check token and extract user
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; 
    next();
  });
}

// GET user's cart
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Get all cart items for this user
    const cartResult = await client.query(`
      SELECT * FROM cart_items WHERE user_id = $1
    `, [userId]);

    const cartItems = cartResult.rows;

    // Get product info 
    const productIds = cartItems.map(item => item.product_id);
    const placeholders = productIds.map((_, i) => `$${i + 1}`).join(', ');

    let products = [];
    if (productIds.length > 0) {
      const productResult = await client.query(
        `SELECT id, name, price FROM products WHERE id IN (${placeholders})`,
        productIds
      );
      products = productResult.rows;
    }

    // Build cart with product details
    const detailedCart = cartItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
      return {
        productId: item.product_id,
        quantity: item.quantity,
        name: product?.name,
        price: product?.price
      };
    });

    res.json(detailedCart);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity required' });
  }

  try {
    // Check if the product exists
    const existing = await client.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existing.rows.length > 0) {
      // Update the quantity
      const updated = await client.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [quantity, userId, productId]
      );
      return res.status(200).json(updated.rows[0]);
    } else {
      // Insert a new item
      const inserted = await client.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [userId, productId, quantity]
      );
      return res.status(201).json(inserted.rows[0]);
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
