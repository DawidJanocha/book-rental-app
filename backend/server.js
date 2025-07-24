// src/server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import bulkImportRoutes from './routes/bulkImportRoutes.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import storeRoutes from './routes/storeRoutes.js';
import orderRoutes from './routes/order.js';
import statsRoutes from './routes/stats.js';
import salesRoutes from './routes/salesRoutes.js';
import userRoutes from './routes/user.js'; 
import contactRoutes from './routes/contact.js';




dotenv.config();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/partner-products', bulkImportRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/sales', salesRoutes);
app.use('/api', statsRoutes);
app.use('/contact', contactRoutes);


// Connect DB & Start Server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  // Ενεργοποίηση της σύνδεσης με τη βάση δεδομένων
  app.listen(5001, () => console.log('🚀 Server running on http://localhost:5001'));
})
.catch((err) => console.error('❌ MongoDB error:', err));
