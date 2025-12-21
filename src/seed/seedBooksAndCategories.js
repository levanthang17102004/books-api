/** @format */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bookstore = require('../models/bookstoreModel');
const Category = require('../models/categoryModel');
const Book = require('../models/bookModel');

dotenv.config();
const connectDB = require('../config/db');
connectDB();

const categoriesList = [
  'Lịch Sử',
  'Kỹ Năng Sống',
  'Kinh Tế',
  'Công Nghệ',
  'Giáo Khoa',
  'Ngoại Ngữ',
  'Thiếu Nhi'
];

const booksPerCategory = 3;

const seedData = async () => {
  try {
    const bookstores = await Bookstore.find();

    for (const bookstore of bookstores) {
      console.log(`Seeding bookstore: ${bookstore.name}`);
      const categoryDocs = [];

      for (const catName of categoriesList) {
        const category = await Category.create({
          title: catName,
          bookstore: bookstore._id
        });

        const bookDocs = [];
        for (let i = 1; i <= booksPerCategory; i++) {
          const book = await Book.create({
            category: category._id,
            title: `${catName} - Quyển ${i}`,
            basePrice: 50000 + i * 10000,
            image: `menu-item/${catName.toLowerCase().replace(/\s/g, '')}-${i}.jpg`,
            options: [
              { title: 'Bìa mềm', description: 'Bìa mềm tiêu chuẩn', additionalPrice: 0 },
              { title: 'Bìa cứng', description: 'Bìa cứng cao cấp', additionalPrice: 30000 }
            ]
          });
          bookDocs.push(book);
        }

        categoryDocs.push({
          _id: category._id,
          title: category.title,
          books: bookDocs
        });
      }

      console.log(`Created ${categoryDocs.length} categories with ${booksPerCategory} books each for bookstore ${bookstore.name}`);
    }

    console.log('Seeding complete!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
