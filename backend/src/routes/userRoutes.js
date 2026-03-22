const express = require('express');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['ADMIN']), getAllUsers);
router.patch('/:id', authMiddleware, roleMiddleware(['ADMIN']), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteUser);

module.exports = router;
