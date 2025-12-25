// Import LikeModel (Mongoose) để thao tác với collection Like trong MongoDB
const LikeModel = require('../models/likeModel');

// express-async-handler giúp bắt lỗi trong async route handler mà không cần try/catch quá nhiều
const asyncHandler = require('express-async-handler');

/**
 * ======================================================
 * API: LIKE / DISLIKE MỘT NHÀ SÁCH
 * ======================================================
 * Mục đích:
 * - Cho phép người dùng like/dislike một bookstore
 *
 * Đầu vào (req.body):
 * - bookstore: id nhà sách
 * - quantity: số lượng thay đổi (thường là +1 hoặc -1)
 *
 * Quy tắc xử lý:
 * - Nếu user đã có like record với bookstore:
 *   + Nếu (quantity hiện tại + quantity mới) === 0 => xóa record (tức bỏ like/dislike)
 *   + Ngược lại => cập nhật quantity
 * - Nếu chưa có record:
 *   + Nếu quantity != 0 => tạo mới record
 *   + Nếu quantity == 0 => báo lỗi (không hợp lệ)
 *
 * Đầu ra:
 * - 200: cập nhật hoặc xóa thành công
 * - 201: tạo mới like/dislike thành công
 * - 400: thiếu dữ liệu hoặc quantity không hợp lệ
 */
const likeBookstore = asyncHandler(async (req, res) => {
  const { bookstore, quantity } = req.body;

  // 1) Validate dữ liệu đầu vào
  if (!bookstore || !quantity) {
    return res.status(400).json({
      message: 'Missing required fields: bookstore or quantity',
    });
  }

  // 2) Lấy userId từ middleware xác thực (thường decode JWT rồi gắn vào req.user)
  const userId = req.user.id;

  // 3) Kiểm tra xem user đã từng like/dislike bookstore này chưa
  const existingLike = await LikeModel.findOne({ user: userId, bookstore });

  // 4) Nếu đã tồn tại record like/dislike
  if (existingLike) {
    // Nếu sau khi cộng thêm quantity mà về 0 => bỏ like/dislike => xóa record
    if (existingLike.quantity + parseInt(quantity, 10) === 0) {
      await LikeModel.deleteOne({ _id: existingLike._id });
      return res.status(200).json({ statusCode: 200 });
    }

    // Cập nhật số lượng like/dislike
    existingLike.quantity += parseInt(quantity, 10);
    await existingLike.save();

    return res.status(200).json({ statusCode: 200 });
  }

  // 5) Nếu chưa có record like/dislike trước đó
  if (parseInt(quantity, 10) !== 0) {
    // Tạo mới record
    const newLike = new LikeModel({
      user: userId,
      bookstore,
      quantity: parseInt(quantity, 10),
    });

    await newLike.save();

    return res.status(201).json({
      message: 'Liked/disliked bookstore successfully',
    });
  }

  // Nếu quantity = 0 khi tạo mới => không hợp lệ
  return res.status(400).json({
    message: 'Invalid quantity: must not be 0 for new like/dislike',
  });
});

/**
 * ======================================================
 * API: LẤY DANH SÁCH NHÀ SÁCH ĐÃ LIKE
 * ======================================================
 * Mục đích:
 * - Lấy danh sách những bookstore mà user đã like/dislike (có record trong LikeModel)
 *
 * Đầu vào (req.query):
 * - current: trang hiện tại (mặc định 1)
 * - pageSize: số bản ghi mỗi trang (mặc định 10)
 *
 * Xử lý:
 * - LikeModel.find({ user: userId })
 * - skip + limit để phân trang
 * - populate('bookstore') để lấy thông tin chi tiết bookstore (join)
 *
 * Đầu ra:
 * - 200: trả về danh sách likes + thông tin phân trang
 * - 500: lỗi server
 */
const getLikedBookstores = async (req, res) => {
  // Lấy thông tin phân trang từ query (mặc định current=1, pageSize=10)
  const { current = 1, pageSize = 10 } = req.query;

  // Lấy userId từ token (req.user được gắn từ middleware auth)
  const userId = req.user.id;

  try {
    // 1) Query danh sách likes của user + phân trang + populate bookstore
    const likes = await LikeModel.find({ user: userId })
      .skip((current - 1) * pageSize) // Bỏ qua số record của trang trước
      .limit(Number(pageSize)) // Giới hạn số record trả về
      .populate('bookstore'); // Lấy thêm thông tin bookstore

    // 2) Trả response thành công
    res.status(200).json({
      success: true,
      message: 'Liked bookstores retrieved successfully',
      data: likes,
      pagination: {
        current: Number(current),
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    console.error(error);

    // Trả lỗi server
    res.status(500).json({
      success: false,
      message: 'Error retrieving liked bookstores',
    });
  }
};

/**
 * ======================================================
 * API: XÓA LIKE CỦA USER VỚI 1 BOOKSTORE
 * ======================================================
 * Mục đích:
 * - Xóa record like/dislike giữa user và bookstore
 *
 * Đầu vào (req.body):
 * - bookstore: id nhà sách muốn bỏ like/dislike
 *
 * Đầu ra:
 * - 200: xóa thành công
 * - 404: không tìm thấy record để xóa
 * - 400: thiếu bookstore
 * - 500: lỗi server
 */
const deleteLike = asyncHandler(async (req, res) => {
  const { bookstore } = req.body;

  // 1) Validate input
  if (!bookstore) {
    return res.status(400).json({
      message: 'Missing required field: bookstore',
    });
  }

  // 2) Lấy userId từ middleware xác thực
  const userId = req.user.id;

  try {
    // 3) Xóa like/dislike theo userId và bookstore
    const deleteResult = await LikeModel.deleteOne({ user: userId, bookstore });

    // 4) Kiểm tra kết quả xóa
    if (deleteResult.deletedCount > 0) {
      return res.status(200).json({
        success: true,
        message: 'Like removed successfully',
      });
    }

    // Không có record nào bị xóa => không tồn tại like
    return res.status(404).json({
      success: false,
      message: 'No like found to remove',
    });
  } catch (error) {
    console.error(error);

    // Lỗi server
    return res.status(500).json({
      success: false,
      message: 'Error removing like',
    });
  }
});

/**
 * Export các controller function để router sử dụng
 */
module.exports = { likeBookstore, getLikedBookstores, deleteLike };
