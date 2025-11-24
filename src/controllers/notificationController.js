const NotificationModel = require('../models/notificationModel');
const asyncHandler = require('express-async-handler');


// API: Tạo thông báo mới cho người dùng
const sendNotification = asyncHandler(async (req, res) => {
    const { data } = req.body; // Lấy mảng thông báo từ body
    const userId = req.user.id; // Lấy userId từ token đã được xác thực qua middleware

    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: 'Missing required field: data or data is empty' });
    }

    try {
        // Tạo mảng các thông báo từ mảng data
        const notifications = await Promise.all(data.map(async (item) => {
            if (!item.message) {
                throw new Error('Each notification must have a message');
            }
            const newNotification = new NotificationModel({
                user: userId, // Dùng userId từ token
                title: item.title, // Lưu title nếu có
                message: item.message, // Lưu message
                read: item.read || false, // Đánh dấu read mặc định là false
            });

            return newNotification.save(); // Lưu từng thông báo
        }));

        res.status(201).json({
            success: true,
            message: 'Notifications sent successfully',
            data: notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error sending notifications',
        });
    }
});


// API để lấy thông báo của người dùng thông qua accessToken
const getUserNotifications = asyncHandler(async (req, res) => {
    const { current = 1, pageSize = 10 } = req.query;
    const userId = req.user.id; // Lấy ID người dùng từ token (được xác thực qua middleware)

    try {
        // Lấy danh sách các thông báo của người dùng
        const notifications = await NotificationModel.find({ user: userId })
            .skip((current - 1) * pageSize) // phân trang
            .limit(Number(pageSize)) // giới hạn số lượng
            .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo (mới nhất trước)

        // Trả về kết quả
        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: notifications,
            pagination: {
                current: Number(current),
                pageSize: Number(pageSize),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving notifications',
        });
    }
});

// API để đánh dấu thông báo là đã đọc
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await NotificationModel.findOne({ _id: notificationId, user: req.user.id });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true; // Đánh dấu thông báo là đã đọc
        await notification.save();

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
        });
    }
});

module.exports = { getUserNotifications, markNotificationAsRead, sendNotification};
