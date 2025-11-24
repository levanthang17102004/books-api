/** @format */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/connectDb');
const Bookstore = require('../models/bookstoreModel');
const Category = require('../models/categoryModel');
const Book = require('../models/bookModel');

// Dữ liệu mẫu cho bookstores (sử dụng ảnh từ thư mục restaurant)
const bookstoresData = [
  {
    name: 'Nhà Sách Fahasa',
    phone: '02838225679',
    address: '60-62 Lê Lợi, Quận 1, TP.HCM',
    email: 'contact@fahasa.com',
    rating: 4.8,
    image: 'restaurant/res2-1725268278671.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Phương Nam',
    phone: '02838225680',
    address: '174 Nguyễn Huệ, Quận 1, TP.HCM',
    email: 'info@phuongnam.com',
    rating: 4.7,
    image: 'restaurant/res3-1725269164601.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Trí Việt',
    phone: '02838225681',
    address: '366 Nguyễn Trãi, Quận 5, TP.HCM',
    email: 'contact@triviet.com',
    rating: 4.6,
    image: 'restaurant/res4-1725270324941.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Văn Lang',
    phone: '02838225682',
    address: '417 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    email: 'info@vanlang.com',
    rating: 4.9,
    image: 'restaurant/res5-1725271297545.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Minh Khai',
    phone: '02838225683',
    address: '249 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    email: 'contact@minhkhai.com',
    rating: 4.5,
    image: 'restaurant/res6-1725329231952.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Nguyễn Văn Cừ',
    phone: '02838225684',
    address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
    email: 'info@nguyenvancu.com',
    rating: 4.7,
    image: 'restaurant/res7-1725329350536.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Thăng Long',
    phone: '02838225685',
    address: '180 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    email: 'contact@thanglong.com',
    rating: 4.6,
    image: 'restaurant/res8-1725329559299.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Kim Đồng',
    phone: '02838225686',
    address: '248 Cống Quỳnh, Quận 1, TP.HCM',
    email: 'info@kimdong.com',
    rating: 4.8,
    image: 'restaurant/res9-1725329672812.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Tiki',
    phone: '02838225687',
    address: '123 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    email: 'contact@tiki.com',
    rating: 4.9,
    image: 'restaurant/res10-1725329810831.jpg',
    isActive: true
  },
  {
    name: 'Nhà Sách Vinabook',
    phone: '02838225688',
    address: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
    email: 'info@vinabook.com',
    rating: 4.7,
    image: 'restaurant/res11-1725329930467.jpg',
    isActive: true
  }
];

// Dữ liệu categories mẫu (mỗi bookstore sẽ có các categories này)
const categoriesData = [
  'Sách Văn Học',
  'Sách Kinh Tế',
  'Sách Kỹ Năng Sống',
  'Sách Thiếu Nhi',
  'Sách Giáo Khoa',
  'Sách Ngoại Ngữ',
  'Sách Công Nghệ',
  'Sách Lịch Sử'
];

// Dữ liệu books mẫu (sử dụng ảnh từ thư mục menu-item)
const bookImages = [
  'menu-item/vn-11134517-7r98o-lqvyczvind8kbd-1725329732039.jpg',
  'menu-item/vn-11134517-7r98o-lqvyd0r5d2v8f1-1725329763545.jpg',
  'menu-item/vn-11134517-7r98o-lqx4te1wcsrd47-1725268624989.jpg',
  'menu-item/vn-11134517-7r98o-lqx9ga08fxqxb6-1725268950934.jpg',
  'menu-item/vn-11134517-7r98o-lqxb21jhan4pf7-1725268989387.jpg',
  'menu-item/vn-11134517-7r98o-lqxfm47dlwgpb7-1725272219052.jpg',
  'menu-item/vn-11134517-7r98o-lqxfm5942ojo45-1725272282438.jpg',
  'menu-item/vn-11134517-7r98o-lqxfoc8khml546-1725272475765.jpg',
  'menu-item/vn-11134517-7r98o-lqxfsof3xpy184-1725272376837.jpg',
  'menu-item/vn-11134517-7r98o-lqxfu6cj0ouc5b-1725272250086.jpg',
  'menu-item/vn-11134517-7r98o-lqxiybehbgec50-1725329419031.jpg',
  'menu-item/vn-11134517-7r98o-lqxk9hps03a1c5-1725329439040.jpg',
  'menu-item/vn-11134517-7r98o-lqxl08dd9tw91e-1725272324512.jpg',
  'menu-item/vn-11134517-7r98o-lqxlp83gmuo408-1725270724725.jpg',
  'menu-item/vn-11134517-7r98o-lqxlugct50ux8f-1725270939843.jpg',
  'menu-item/vn-11134517-7r98o-lqxmxzyzukyha9-1725269496158.jpg',
  'menu-item/vn-11134517-7r98o-lqy1uibtmls493-1725268662393.jpg',
  'menu-item/vn-11134517-7r98o-lqytg103fixl0e-1725270984027.jpg',
  'menu-item/vn-11134517-7r98o-lqyvp5gnowckc5-1725270962367.jpg',
  'menu-item/vn-11134517-7r98o-lqz2slhof1dw00-1725272535337.jpg',
  'menu-item/vn-11134517-7r98o-lqzjdkzk7q8p3d-1725272563817.jpg',
  'menu-item/vn-11134517-7r98o-lqzkdbzytv441b-1725272106009.jpg',
  'menu-item/vn-11134517-7r98o-lqzkh1zoqxmseb-1725272173815.jpg',
  'menu-item/vn-11134517-7r98o-lqzm4hv7c6v8d1-1725272507064.jpg',
  'menu-item/vn-11134517-7r98o-lqznaipbg2pw7a-1725272083675.jpg',
  'menu-item/vn-11134517-7r98o-lqzor8mo3lp574-1725271993560.jpg',
  'menu-item/vn-11134517-7r98o-lqzown6zdn0k7d-1725272139701.jpg',
  'menu-item/vn-11134517-7r98o-lqztk12f7c9072-1725271939380.jpg',
  'menu-item/vn-11134517-7r98o-lr040w4hgi4ke5-1725271966974.jpg',
  'menu-item/vn-11134517-7r98o-lr0994il12mx9f-1725268565002.jpg'
];

const bookTitles = [
  'Đắc Nhân Tâm',
  'Nhà Giả Kim',
  'Tôi Tài Giỏi, Bạn Cũng Thế',
  'Sapiens: Lược Sử Loài Người',
  'Homo Deus: Lược Sử Tương Lai',
  '21 Bài Học Cho Thế Kỷ 21',
  'Tư Duy Nhanh và Chậm',
  'Sức Mạnh Của Thói Quen',
  'Người Bán Hàng Vĩ Đại Nhất Thế Giới',
  'Dám Bị Ghét',
  'Từ Tốt Đến Vĩ Đại',
  '7 Thói Quen Của Người Thành Đạt',
  'Nghệ Thuật Tư Duy Rành Mạch',
  'Đọc Vị Bất Kỳ Ai',
  'Làm Chủ Tư Duy, Thay Đổi Vận Mệnh',
  'Bí Mật Tư Duy Triệu Phú',
  'Người Giàu Nhất Thành Babylon',
  'Cha Giàu Cha Nghèo',
  'Nhà Đầu Tư Thông Minh',
  'Bước Đi Ngẫu Nhiên Trên Phố Wall',
  'Cà Phê Cùng Tony',
  'Trên Đường Băng',
  'Tuổi Trẻ Đáng Giá Bao Nhiêu',
  'Mình Nói Gì Khi Nói Về Hạnh Phúc',
  'Đi Tìm Lẽ Sống',
  'Những Người Khốn Khổ',
  'Bố Già',
  'Chúa Ruồi',
  '1984',
  'Trại Súc Vật'
];

const seedDatabase = async () => {
  try {
    // Kết nối database
    await connectDB();
    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ (tùy chọn - comment nếu muốn giữ dữ liệu cũ)
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Bookstore.deleteMany({});
    console.log('Cleared existing data');

    // Tạo bookstores
    const createdBookstores = await Bookstore.insertMany(bookstoresData);
    console.log(`Created ${createdBookstores.length} bookstores`);

    // Tạo categories và books cho mỗi bookstore
    let totalCategories = 0;
    let totalBooks = 0;

    for (const bookstore of createdBookstores) {
      // Tạo categories cho mỗi bookstore (mỗi bookstore có 4-6 categories ngẫu nhiên)
      const numCategories = Math.floor(Math.random() * 3) + 4; // 4-6 categories
      const selectedCategories = categoriesData
        .sort(() => 0.5 - Math.random())
        .slice(0, numCategories);

      const categoriesToInsert = selectedCategories.map(title => ({
        bookstore: bookstore._id,
        title
      }));

      const createdCategories = await Category.insertMany(categoriesToInsert);
      totalCategories += createdCategories.length;
      console.log(`Created ${createdCategories.length} categories for ${bookstore.name}`);

      // Tạo books cho mỗi category (mỗi category có 3-5 books)
      for (const category of createdCategories) {
        const numBooks = Math.floor(Math.random() * 3) + 3; // 3-5 books
        const booksToInsert = [];

        for (let i = 0; i < numBooks; i++) {
          const randomTitleIndex = Math.floor(Math.random() * bookTitles.length);
          const randomImageIndex = Math.floor(Math.random() * bookImages.length);
          const basePrice = Math.floor(Math.random() * 200000) + 50000; // 50,000 - 250,000 VND

          booksToInsert.push({
            category: category._id,
            title: bookTitles[randomTitleIndex],
            basePrice,
            image: bookImages[randomImageIndex],
            options: [
              {
                title: 'Bìa cứng',
                description: 'Bản bìa cứng cao cấp',
                additionalPrice: 50000
              },
              {
                title: 'Bìa mềm',
                description: 'Bản bìa mềm tiêu chuẩn',
                additionalPrice: 0
              }
            ]
          });
        }

        const createdBooks = await Book.insertMany(booksToInsert);
        totalBooks += createdBooks.length;
      }
    }

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`📚 Total bookstores: ${createdBookstores.length}`);
    console.log(`📁 Total categories: ${totalCategories}`);
    console.log(`📖 Total books: ${totalBooks}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Chạy seed
seedDatabase();

