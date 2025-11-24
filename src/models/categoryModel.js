const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    bookstore: { type: mongoose.Schema.Types.ObjectId, ref: 'bookstores', required: true },
    title: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('categories', categorySchema);

