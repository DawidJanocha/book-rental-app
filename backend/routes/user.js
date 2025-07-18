// routes/user.js
import express from 'express';
import {
  saveUserDetails,
  getUserDetails,
  changePassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';



const router = express.Router();

// Αποθήκευση / ενημέρωση στοιχείων χρήστη
router.post('/details', protect, saveUserDetails);

// Ανάκτηση στοιχείων χρήστη
router.get('/details', protect, getUserDetails);

// Αλλαγή κωδικού πρόσβασης
router.put('/password', protect, changePassword);

export default router;
