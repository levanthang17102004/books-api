// Import model Book (Mongoose) để thao tác với collection sách trong MongoDB
const Book = require('../models/bookModel');

/**
 * ==============================
 * API: LẤY DANH SÁCH SÁCH THEO DANH MỤC (CATEGORY)
 * ==============================
 * Mục đích:
 * - Lấy tất cả sách thuộc một danh mục cụ thể
 *
 * Đầu vào:
 * - req.params.categoryId: id của danh mục (category) lấy từ URL
 *   Ví dụ route: /books/category/:categoryId
 *
 * Xử lý:
 * - Query MongoDB: tìm các sách có field `category` trùng với categoryId
 *
 * Đầu ra:
 * - 200: trả về mảng books
 * - 500: lỗi server khi truy vấn DB
 */
const getBooksByCategory = async (req, res) => {
  try {
    // Lấy categoryId từ params (được truyền lên từ route)
    const categoryId = req.params.categoryId;

    // Tìm tất cả sách có category = categoryId
    // Lưu ý: field `category` trong schema thường là ObjectId tham chiếu đến Category
    const books = await Book.find({ category: categoryId });

    // Trả về danh sách sách theo danh mục
    res.status(200).json(books);
  } catch (error) {
    // Nếu có lỗi trong quá trình truy vấn DB, trả về lỗi 500
    res.status(500).json({ message: 'Error fetching books', error });
  }
};

// Export controller để dùng ở router
module.exports = {
  getBooksByCategory,
};
