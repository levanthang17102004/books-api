const mongoose = require('mongoose');

const bookstoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    email: { type: String },
    rating: { type: Number, default: 0 },
    image: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('bookstores', bookstoreSchema);

