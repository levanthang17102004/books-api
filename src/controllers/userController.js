const asyncHandle = require('express-async-handler');
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

const updateProfile = asyncHandle(async (req, res) => {
    const { name, email, phone, address, photo } = req.body; // Nhận dữ liệu từ body

    // Lấy thông tin user từ middleware verifyToken
    const userId = req.user.id;

    // Tìm người dùng theo ID
    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(404).json({
            message: 'User not found!',
        });
    }

    // Cập nhật thông tin người dùng
    const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { name, email, phone, address, photo },
        { new: true }
    );

    res.status(200).json({
        message: 'User profile updated successfully!',
        data: updatedUser,
    });
});

const changePassword = asyncHandle(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Lấy thông tin user từ middleware verifyToken
    const userId = req.user.id;

    // Tìm người dùng theo ID
    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(404).json({
            message: 'User not found!',
        });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({
            message: 'Current password is incorrect!',
        });
    }

    // Mã hoá mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        message: 'Password changed successfully!',
    });
});

module.exports = { updateProfile, changePassword  };
