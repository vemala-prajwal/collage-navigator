const express = require('express');
const {
  registerUser,
  loginUser,
  registerValidators,
  loginValidators,
  getCampuses,
} = require('../controllers/authController');
const { getCurrentUser } = require('../lib/authService');

const router = express.Router();

router.get('/campuses', getCampuses);
router.post('/register', registerValidators, registerUser);
router.post('/login', loginValidators, loginUser);
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const user = await getCurrentUser(token);
    res.json({ user });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
});

module.exports = router;
