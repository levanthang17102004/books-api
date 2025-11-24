const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, 
    bookstore: { type: mongoose.Schema.Types.ObjectId, ref: 'bookstores', required: true }, 
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('likes', likeSchema);
