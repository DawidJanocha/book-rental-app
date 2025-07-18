// models/Store.js
import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  afm: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookCategories: {
    type: [String], // 📚 Λίστα κατηγοριών π.χ. ['Λογοτεχνία', 'Ιστορία']
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.model('Store', storeSchema);
