// backend/models/Order.js

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  title: {
    type: String,
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  store: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Store',
  required: true
},
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  comments: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered','declined'],
    default: 'pending'
  },
  estimatedTime: {
    type: String // π.χ. "30 minutes"
  },
  totalPrice:{
    type: mongoose.Schema.Types.Decimal128,
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
