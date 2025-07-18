// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'seller'], required: true },
  email: { type: String, required: true, unique: true },
   isVerified: { type: Boolean, default: false}, verificationToken: String,
}, { timestamps: true });

export default mongoose.model('User', userSchema);
