import express from 'express';
import { login, register, verifyOTP, resendOTP, createAdmin, updateEmail } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/create-admin', createAdmin);
router.post('/update-email', authMiddleware, updateEmail);

export default router;
