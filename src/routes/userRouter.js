const Router = require('express');
const { updateProfile, changePassword } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

const userRouter = Router();    

userRouter.patch('/', verifyToken, updateProfile);
userRouter.post('/change-password', verifyToken, changePassword);

module.exports = userRouter;
