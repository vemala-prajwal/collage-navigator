const express = require('express');
const { registerUser, loginUser, authValidators } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authValidators, registerUser);
router.post('/login', authValidators, loginUser);
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
