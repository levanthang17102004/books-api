/** @format */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import Models (Đảm bảo đường dẫn đúng với cấu trúc folder của bạn)
const Bookstore = require('./src/models/bookstoreModel');
const Category = require('./src/models/categoryModel');
const Book = require('./src/models/bookModel');
const connectDB = require('./src/config/connectDb'); // Đường dẫn tới file connect db của bạn

dotenv.config();
connectDB();

// Cấu hình danh sách Category và Prefix tên ảnh tương ứng
// Script sẽ ghép: "menu-item/" + imagePrefix + "-" + i + ".jpg"
const categoriesConfig = [
    { title: 'Lịch Sử', imagePrefix: 'lichsu' },
    { title: 'Kỹ Năng Sống', imagePrefix: 'kynang' },
    { title: 'Kinh Tế', imagePrefix: 'kinhte' },
    { title: 'Công Nghệ', imagePrefix: 'congnghe' },
    { title: 'Giáo Khoa', imagePrefix: 'giaokhoa' },
    { title: 'Ngoại Ngữ', imagePrefix: 'ngoai-ngu' }, // Dựa theo dữ liệu mẫu bạn gửi là 'ngoai-ngu'
    { title: 'Thiếu Nhi', imagePrefix: 'thieunhi' }
];

const booksPerCategory = 3;

const seedData = async () => {
    try {
        console.log('🔄 Đang bắt đầu quá trình tạo dữ liệu...');

        // 1. Kiểm tra xem có nhà sách nào chưa
        const bookstores = await Bookstore.find();
        if (bookstores.length === 0) {
            console.error('❌ LỖI: Không tìm thấy Nhà sách nào (Bookstore). Vui lòng tạo Nhà sách trước.');
            process.exit(1);
        }

        // 2. Xóa dữ liệu Category và Book cũ để tránh trùng lặp (Cẩn thận khi dùng trên Production)
        await Category.deleteMany();
        await Book.deleteMany();
        console.log('🗑️  Đã xóa sạch dữ liệu Category và Book cũ.');

        // 3. Vòng lặp chính
        for (const bookstore of bookstores) {
            console.log(`\n🏢 Đang tạo dữ liệu cho nhà sách: ${bookstore.name}...`);

            const categoryPromises = categoriesConfig.map(async (config) => {
                // A. Tạo Category
                const newCategory = await Category.create({
                    bookstore: bookstore._id,
                    title: config.title
                });

                // B. Tạo 3 Sách cho Category này
                const bookPromises = [];
                for (let i = 1; i <= booksPerCategory; i++) {

                    // Tạo giá ngẫu nhiên cho phong phú (từ 50k đến 200k)
                    const randomPrice = Math.floor(Math.random() * (200 - 50 + 1) + 50) * 1000;

                    bookPromises.push(
                        Book.create({
                            category: newCategory._id,
                            title: `${config.title} - Quyển ${i}`, // Ví dụ: Lịch Sử - Quyển 1
                            basePrice: randomPrice,
                            // Tạo đường dẫn ảnh: menu-item/lichsu-1.jpg
                            image: `menu-item/${config.imagePrefix}-${i}.jpg`,
                            options: [
                                {
                                    title: 'Bìa mềm',
                                    description: 'Bìa mềm tiêu chuẩn, gọn nhẹ',
                                    additionalPrice: 0
                                },
                                {
                                    title: 'Bìa cứng',
                                    description: 'Bìa cứng cao cấp, bền đẹp',
                                    additionalPrice: 30000
                                }
                            ]
                        })
                    );
                }

                // Chờ tạo xong 3 cuốn sách của Category này
                await Promise.all(bookPromises);
                return newCategory;
            });

            // Chờ tạo xong 7 Category cho Bookstore này
            await Promise.all(categoryPromises);
            console.log(`✅ Hoàn tất ${categoriesConfig.length} danh mục và ${categoriesConfig.length * booksPerCategory} sách cho ${bookstore.name}`);
        }

        console.log('\n🎉🎉🎉 SEEDING COMPLETE! Đã tạo xong toàn bộ dữ liệu.');
        process.exit();

    } catch (error) {
        console.error('❌ Có lỗi xảy ra:', error);
        process.exit(1);
    }
};

seedData();