const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const carts = {}; 

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
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const userCart = carts[userId] || [];

    const products = req.app.locals.products;
  
      const detailedCart = userCart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        name: product?.name,       
        price: product?.price      
      };
    });
  
    res.json(detailedCart);
  });

// POST item to cart
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  carts[userId] = carts[userId] || [];

  const existingItem = carts[userId].find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[userId].push({ productId, quantity });
  }

  res.status(201).json(carts[userId]);
});

// DELETE item
router.delete('/:productId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.productId);

  if (!carts[userId]) return res.sendStatus(404);

  carts[userId] = carts[userId].filter(item => item.productId !== productId);
  res.json(carts[userId]);
});

// PUT - update quantity
router.put('/:productId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  const cart = carts[userId];
  if (!cart) return res.sendStatus(404);

  const item = cart.find(item => item.productId === productId);
  if (!item) return res.sendStatus(404);

  item.quantity = quantity;
  res.json(cart);
});

module.exports = router;
