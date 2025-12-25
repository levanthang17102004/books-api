// Import NotificationModel (Mongoose) để thao tác với collection Notification trong MongoDB
const NotificationModel = require('../models/notificationModel');

// express-async-handler giúp bắt lỗi trong async route handler (không cần try/catch ở mọi nơi)
const asyncHandler = require('express-async-handler');

/**
 * ======================================================
 * API: TẠO / GỬI THÔNG BÁO MỚI CHO NGƯỜI DÙNG
 * ======================================================
 * Mục đích:
 * - Tạo nhiều thông báo cùng lúc cho user đang đăng nhập (theo token)
 *
 * Đầu vào (req.body):
 * - data: mảng các thông báo
 *   Ví dụ:
 *   {
 *     "data": [
 *       { "title": "Thông báo", "message": "Bạn có đơn hàng mới" },
 *       { "title": "Khuyến mãi", "message": "Giảm 20% hôm nay" }
 *     ]
 *   }
 *
 * Dữ liệu user:
 * - userId lấy từ req.user.id (do middleware auth giải mã token và gắn vào req.user)
 *
 * Xử lý:
 * - Validate data: phải là mảng và không rỗng
 * - Mỗi phần tử trong data bắt buộc có message
 * - Tạo NotificationModel cho từng phần tử và lưu DB
 *
 * Đầu ra:
 * - 201: tạo thành công + trả về danh sách thông báo đã tạo
 * - 400: thiếu data hoặc data rỗng/sai định dạng
 * - 500: lỗi server khi tạo
 */
const sendNotification = asyncHandler(async (req, res) => {
  const { data } = req.body; // Lấy mảng thông báo từ body
  const userId = req.user.id; // Lấy userId từ token đã xác thực qua middleware

  // 1) Validate đầu vào
  if (!data || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({
      message: 'Missing required field: data or data is empty',
    });
  }

  try {
    // 2) Tạo và lưu nhiều thông báo đồng thời bằng Promise.all
    const notifications = await Promise.all(
      data.map(async (item) => {
        // Mỗi item bắt buộc có message
        if (!item.message) {
          throw new Error('Each notification must have a message');
        }

        // Tạo notification mới
        const newNotification = new NotificationModel({
          user: userId, // Gắn userId từ token
          title: item.title, // Lưu title (nếu có)
          message: item.message, // Lưu nội dung thông báo
          read: item.read || false, // Mặc định chưa đọc
        });

        // Lưu vào DB
        return newNotification.save();
      })
    );

    // 3) Trả response thành công
    res.status(201).json({
      success: true,
      message: 'Notifications sent successfully',
      data: notifications,
    });
  } catch (error) {
    console.error(error);

    // Trả lỗi server
    res.status(500).json({
      success: false,
      message: 'Error sending notifications',
    });
  }
});

/**
 * ======================================================
 * API: LẤY DANH SÁCH THÔNG BÁO CỦA NGƯỜI DÙNG
 * ======================================================
 * Mục đích:
 * - Lấy danh sách notifications của user đang đăng nhập (theo token)
 *
 * Đầu vào (req.query):
 * - current: trang hiện tại (mặc định 1)
 * - pageSize: số lượng item mỗi trang (mặc định 10)
 *
 * Xử lý:
 * - Find theo userId
 * - skip/limit phân trang
 * - sort theo createdAt giảm dần (mới nhất trước)
 *
 * Đầu ra:
 * - 200: trả danh sách notifications + pagination
 * - 500: lỗi server
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  const { current = 1, pageSize = 10 } = req.query;
  const userId = req.user.id; // Lấy ID người dùng từ token

  try {
    // 1) Query danh sách thông báo của user + phân trang + sắp xếp mới nhất trước
    const notifications = await NotificationModel.find({ user: userId })
      .skip((current - 1) * pageSize) // Bỏ qua item của trang trước
      .limit(Number(pageSize)) // Giới hạn số lượng item
      .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo (desc)

    // 2) Trả response
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

    // Lỗi server
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
    });
  }
});

/**
 * ======================================================
 * API: ĐÁNH DẤU THÔNG BÁO LÀ ĐÃ ĐỌC
 * ======================================================
 * Mục đích:
 * - Đổi trạng thái read = true cho 1 notification cụ thể của chính user đó
 *
 * Đầu vào (req.params):
 * - notificationId: id của thông báo
 *   Ví dụ route: /notifications/:notificationId/read
 *
 * Xử lý:
 * - Tìm notification theo:
 *   + _id = notificationId
 *   + user = req.user.id (đảm bảo user chỉ sửa thông báo của chính họ)
 * - Nếu không có => 404
 * - Nếu có => set read = true và save
 *
 * Đầu ra:
 * - 200: đánh dấu thành công
 * - 404: không tìm thấy notification
 * - 500: lỗi server
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  try {
    // 1) Tìm notification theo id + userId để đảm bảo đúng quyền
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      user: req.user.id,
    });

    // 2) Không tìm thấy
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // 3) Cập nhật trạng thái đã đọc
    notification.read = true;
    await notification.save();

    // 4) Trả response
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);

    // Lỗi server
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
    });
  }
});

// Export controller để router sử dụng
module.exports = { getUserNotifications, markNotificationAsRead, sendNotification };
