const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'Unauthorized' });

	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY);
		req.user = decoded; // Gán thông tin vào req.user
		next();
	} catch (err) {
		res.status(403).json({ message: 'Forbidden' });
	}
};

module.exports = verifyToken;
