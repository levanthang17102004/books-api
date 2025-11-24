const { Router } = require('express');
const { getUserNotifications, markNotificationAsRead , sendNotification} = require('../controllers/notificationController');
const verifyToken = require('../middleware/authMiddleware');

const notificationRouter = Router();
notificationRouter.post('/send', verifyToken, sendNotification);

// Route để lấy thông báo của người dùng
notificationRouter.get('/', verifyToken, getUserNotifications);

// Route để đánh dấu thông báo là đã đọc
notificationRouter.patch('/:notificationId/read', verifyToken, markNotificationAsRead);

module.exports = notificationRouter;