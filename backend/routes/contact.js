import express from 'express';
import { handleSupportRequest } from '../controllers/supportController.js';
const router = express.Router();

router.post('/', handleSupportRequest);

export default router;
