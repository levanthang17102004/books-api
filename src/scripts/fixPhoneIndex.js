/** @format */
const mongoose = require('mongoose');
require('dotenv').config();

const fixPhoneIndex = async () => {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Xóa index cũ nếu tồn tại
    try {
      await collection.dropIndex('phone_1');
      console.log('✅ Đã xóa index cũ: phone_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index phone_1 không tồn tại, bỏ qua...');
      } else {
        throw error;
      }
    }

    // Tạo lại index mới với sparse: true
    await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('✅ Đã tạo lại index mới: phone_1 (unique, sparse)');

    console.log('✅ Hoàn thành! Index đã được sửa.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

fixPhoneIndex();

