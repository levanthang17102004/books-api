const LikeModel = require('../models/likeModel');
const asyncHandler = require('express-async-handler');

// API: Like hoặc Dislike một nhà sách
const likeBookstore = asyncHandler(async (req, res) => {
    const { bookstore, quantity } = req.body;

    if (!bookstore || !quantity) {
        return res.status(400).json({ message: 'Missing required fields: bookstore or quantity' });
    }

    const userId = req.user.id; // Lấy userId từ middleware xác thực

    // Kiểm tra nếu đã tồn tại lượt thích cho nhà sách này
    const existingLike = await LikeModel.findOne({ user: userId, bookstore });

    if (existingLike) {
        // Nếu số lượng bằng 0, xóa lượt thích
        if (existingLike.quantity + parseInt(quantity, 10) === 0) {
            await LikeModel.deleteOne({ _id: existingLike._id });
            return res.status(200).json({statusCode: 200 });
        }

        // Cập nhật số lượng like/dislike
        existingLike.quantity += parseInt(quantity, 10);
        await existingLike.save();
        return res.status(200).json({ statusCode: 200 });
    } else {
        // Nếu không có lượt thích trước đó, tạo mới
        if (parseInt(quantity, 10) !== 0) {
            const newLike = new LikeModel({
                user: userId,
                bookstore,
                quantity: parseInt(quantity, 10),
            });
            await newLike.save();
            return res.status(201).json({ message: 'Liked/disliked bookstore successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid quantity: must not be 0 for new like/dislike' });
        }
    }
});

// API để lấy danh sách các nhà sách đã liked
const getLikedBookstores = async (req, res) => {
    const { current = 1, pageSize = 10 } = req.query;
    const userId = req.user.id; // Lấy ID người dùng từ token
  
    try {
      // Lấy danh sách các nhà sách đã liked của người dùng
      const likes = await LikeModel.find({ user: userId })
        .skip((current - 1) * pageSize) // phân trang
        .limit(Number(pageSize)) // giới hạn số lượng
        .populate('bookstore'); // Join với bảng bookstore (để lấy thông tin nhà sách)
  
      // Trả về kết quả
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
      res.status(500).json({
        success: false,
        message: 'Error retrieving liked bookstores',
      });
    }
  };

  const deleteLike = asyncHandler(async (req, res) => {
    const { bookstore } = req.body;

    if (!bookstore) {
        return res.status(400).json({ message: 'Missing required field: bookstore' });
    }

    const userId = req.user.id; // Lấy userId từ middleware xác thực

    try {
        // Xóa lượt thích của người dùng với nhà sách cụ thể
        const deleteResult = await LikeModel.deleteOne({ user: userId, bookstore });

        if (deleteResult.deletedCount > 0) {
            return res.status(200).json({ success: true, message: 'Like removed successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'No like found to remove' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error removing like' });
    }
});


module.exports = { likeBookstore, getLikedBookstores, deleteLike};
