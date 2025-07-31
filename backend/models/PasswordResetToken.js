// models/PasswordResetToken.js
import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Instance helper
passwordResetTokenSchema.methods.isExpired = function () {
  return Date.now() > this.expiresAt;
};

export default mongoose.model('PasswordResetToken', passwordResetTokenSchema);
