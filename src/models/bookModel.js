const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    title: { type: String, required: true },
    basePrice: { type: Number, required: true },
    image: { type: String },
    options: [
      {
        title: { type: String },
        description: { type: String },
        additionalPrice: { type: Number }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('books', bookSchema);

