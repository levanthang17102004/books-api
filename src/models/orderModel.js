const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    bookstore: { type: mongoose.Schema.Types.ObjectId, ref: 'bookstores', required: true },
    totalPrice: { type: Number, required: true },
    totalQuantity: { type: Number, required: true },
    detail: [
      {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        option: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('orders', orderSchema);
