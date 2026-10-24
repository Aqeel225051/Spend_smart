const express = require('express');
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/me')
  .get(getUserProfile)
  .patch(updateUserProfile);

module.exports = router;
