
const { Router } = require('express');
const {
	register,
	login,
	verification,
	forgotPassword,
	getAccount,
	handleLoginWithGoogle,
} = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/verification', verification);
authRouter.post('/forgotPassword', forgotPassword);
authRouter.get('/get-account', verifyToken, getAccount);
authRouter.post('/google-signin', handleLoginWithGoogle);

module.exports = authRouter;
