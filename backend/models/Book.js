// models/Book.js
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, default: '' },
  description: { type: String, default: '' },

  rentalPrice: {
    type: mongoose.Schema.Types.Decimal128,
    min: 0,
  },
  originalPrice: {
    type: mongoose.Schema.Types.Decimal128,
    default: null, // θα το ορίζουμε κατά την καταχώρηση
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  available: {
    type: Boolean,
    default: true,
  },
  rentedCount: {
    type: Number,
    default: 0,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  store: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Store',
  required: true,
},
imageUrl: {
  type: String,
  default: '',
},
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
