// Import model Order (Mongoose) để thao tác với collection đơn hàng trong MongoDB
const Order = require('../models/orderModel');

// Import model Bookstore để kiểm tra nhà sách có tồn tại trước khi tạo đơn hàng
const Bookstore = require('../models/bookstoreModel');

// express-async-handler giúp bắt lỗi trong async route handler (tự chuyển lỗi về middleware error)
const asyncHandler = require('express-async-handler');

/**
 * ======================================================
 * API: ĐẶT HÀNG (PLACE AN ORDER)
 * ======================================================
 * Mục đích:
 * - Tạo một đơn hàng mới cho người dùng đang đăng nhập
 *
 * Đầu vào (req.body):
 * - bookstore: id nhà sách
 * - totalPrice: tổng giá trị đơn hàng
 * - totalQuantity: tổng số lượng sản phẩm trong đơn
 * - detail: chi tiết đơn hàng (mảng sản phẩm, số lượng, giá, ...)
 *
 * Dữ liệu user:
 * - userId lấy từ req.user.id (được gắn vào từ middleware xác thực token)
 *
 * Quy trình xử lý:
 * 1) Kiểm tra nhà sách có tồn tại không (Bookstore.findById)
 * 2) Nếu tồn tại -> tạo Order mới gắn userId
 * 3) Lưu Order vào DB và trả về _id đơn hàng
 *
 * Đầu ra:
 * - 201: tạo đơn hàng thành công
 * - 404: không tìm thấy nhà sách
 */
const placeAnOrder = asyncHandler(async (req, res) => {
  // 1) Lấy dữ liệu đơn hàng từ body
  const { bookstore, totalPrice, totalQuantity, detail } = req.body;

  // 2) Lấy userId từ middleware xác thực
  const userId = req.user.id;

  // 3) Kiểm tra xem nhà sách có tồn tại hay không
  const existingBookstore = await Bookstore.findById(bookstore);
  if (!existingBookstore) {
    return res.status(404).json({
      statusCode: 404,
      message: 'Không tìm thấy nhà sách',
      timestamp: Date.now(),
    });
  }

  // 4) Tạo đơn hàng mới và liên kết với userId
  const newOrder = new Order({
    bookstore, // id nhà sách
    user: userId, // gán đơn hàng cho user đang đăng nhập
    totalPrice,
    totalQuantity,
    detail, // chi tiết đơn hàng
  });

  // 5) Lưu đơn hàng vào DB
  const savedOrder = await newOrder.save();

  // 6) Trả về response thành công (chỉ trả _id để client dùng tiếp)
  res.status(201).json({
    statusCode: 201,
    message: 'Đơn hàng đã được tạo thành công',
    data: { _id: savedOrder._id },
    timestamp: Date.now(),
  });
});

/**
 * ======================================================
 * API: LẤY TẤT CẢ ĐƠN HÀNG CỦA NGƯỜI DÙNG (GET ALL ORDERS)
 * ======================================================
 * Mục đích:
 * - Lấy danh sách đơn hàng của user đang đăng nhập
 *
 * Đầu vào:
 * - req.user.id: id người dùng từ token
 * - query params (phân trang):
 *   + page: trang hiện tại (mặc định 1)
 *   + limit: số đơn hàng mỗi trang (mặc định 10)
 *
 * Cải tiến so với bản cũ:
 * - Thêm phân trang (skip/limit)
 * - populate bookstore nhưng chỉ lấy field cần thiết (name, address, image)
 * - select chỉ trả về các field cần thiết của order (không trả detail nếu không cần)
 * - Đo thời gian xử lý API bằng start/end (duration)
 *
 * Đầu ra:
 * - 200: trả về danh sách orders
 * - 500: lỗi server
 */
const getAllOrders = asyncHandler(async (req, res) => {
  // 1) Lấy userId từ token
  const userId = req.user.id;

  // 2) Bắt đầu đo thời gian xử lý API
  const start = Date.now();

  // 3) Lấy tham số phân trang từ query
  const page = parseInt(req.query.page) || 1; // trang hiện tại
  const limit = parseInt(req.query.limit) || 10; // số item mỗi trang
  const skip = (page - 1) * limit; // số item cần bỏ qua

  try {
    // 4) Query đơn hàng theo user + phân trang + sắp xếp mới nhất trước
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'bookstore',
        select: 'name address image', // chỉ lấy thông tin nhà sách cần dùng để giảm dung lượng response
      })
      .select('bookstore totalPrice totalQuantity createdAt') // chỉ trả field cần thiết (không trả detail)
      .sort({ createdAt: -1 }) // mới nhất trước
      .skip(skip) // bỏ qua trang trước
      .limit(limit); // giới hạn số lượng đơn hàng trả về

    // 5) Kết thúc đo thời gian
    const end = Date.now();

    // 6) Trả response thành công
    res.status(200).json({
      statusCode: 200,
      message: 'Đã lấy tất cả đơn hàng thành công',
      data: orders,
      duration: `${end - start}ms`, // thời gian xử lý API
      timestamp: end,
    });
  } catch (error) {
    console.error(error);

    // Lỗi server
    res.status(500).json({
      statusCode: 500,
      message: 'Lỗi nội bộ',
      timestamp: Date.now(),
    });
  }
});

// Export controller để router sử dụng
module.exports = { placeAnOrder, getAllOrders };
