const express = require('express');
const userController = require('../controllers/user');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/sign-up', userController.signup);

router.post('/sign-in', userController.login);

// Ensure the authenticate middleware is passed correctly
router.get('/:userId', authenticate.authenticate, userController.fetchUserProfile); 

router.put('/:userId', authenticate.authenticate, userController.editUser);  // Edit user

router.delete('/:userId', authenticate.authenticate, userController.deleteUser);  // Delete user

module.exports = router;
