// Import model Category (Mongoose) để thao tác với collection danh mục trong MongoDB
const Category = require('../models/categoryModel');

/**
 * ==============================
 * API: LẤY DANH SÁCH CATEGORY THEO BOOKSTORE
 * ==============================
 * Mục đích:
 * - Lấy tất cả danh mục (categories) thuộc về một cửa hàng (bookstore) cụ thể
 *
 * Đầu vào:
 * - req.params.bookstoreId: id của bookstore lấy từ URL
 *   Ví dụ route: /categories/bookstore/:bookstoreId
 *
 * Xử lý:
 * - Query MongoDB: tìm các category có field `bookstore` trùng với bookstoreId
 *
 * Đầu ra:
 * - 200: trả về mảng categories
 * - 500: lỗi server khi truy vấn DB
 */
const getCategoriesByBookstore = async (req, res) => {
  try {
    // Lấy bookstoreId từ params (được truyền lên từ route)
    const bookstoreId = req.params.bookstoreId;

    // Tìm tất cả category có bookstore = bookstoreId
    // Lưu ý: field `bookstore` trong schema thường là ObjectId tham chiếu đến Bookstore
    const categories = await Category.find({ bookstore: bookstoreId });

    // Trả về danh sách category theo bookstore
    res.status(200).json(categories);
  } catch (error) {
    // Nếu có lỗi trong quá trình truy vấn DB, trả về lỗi 500
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

/**
 * ==============================
 * API: TẠO CATEGORY MỚI
 * ==============================
 * Mục đích:
 * - Tạo mới một danh mục (category)
 *
 * Đầu vào:
 * - req.body: dữ liệu category gửi lên từ client
 *   Ví dụ: { name: "Kỹ năng sống", bookstore: "<bookstoreId>", ... }
 *
 * Xử lý:
 * - Dùng Category.create(req.body) để tạo và lưu vào DB
 *
 * Đầu ra:
 * - 201: tạo thành công, trả về category vừa tạo
 * - 400: lỗi dữ liệu đầu vào (validation) hoặc không tạo được
 */
const createCategory = async (req, res) => {
  try {
    // Tạo mới category từ dữ liệu client gửi lên
    const category = await Category.create(req.body);

    // Trả về category vừa tạo
    res.status(201).json(category);
  } catch (error) {
    // Nếu lỗi do dữ liệu không hợp lệ/thiếu field,... trả về 400
    res.status(400).json({ message: 'Error creating category', error });
  }
};

// Export controller để router có thể sử dụng
module.exports = {
  getCategoriesByBookstore,
  createCategory,
};
