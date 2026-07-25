const express = require('express');
const {
  registerUser,
  loginUser,
  registerValidators,
  loginValidators,
  getCampuses,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/campuses', getCampuses);
router.post('/register', registerValidators, registerUser);
router.post('/login', loginValidators, loginUser);
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
