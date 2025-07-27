// seedAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Διαγραφή προηγούμενου admin (αν υπάρχει)
    await User.deleteOne({ email: 'admin@example.com' });

    const hashedPassword = await bcrypt.hash('1234', 10);

    const admin = new User({
      username: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true, // Αν θες να το παρακάμψεις τελείως
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
