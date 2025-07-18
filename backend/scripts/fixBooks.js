import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Store from '../models/Store.js';

await mongoose.connect('mongodb://localhost:27017/your-db-name');

const books = await Book.find({ store: { $exists: false } });
const anyStore = await Store.findOne(); // ή βρες ανά χρήστη

for (let book of books) {
  book.store = anyStore._id;
  await book.save();
}

console.log(`✅ Ενημερώθηκαν ${books.length} βιβλία`);
process.exit();
