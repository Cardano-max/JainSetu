import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import { sendOtpSchema, verifyOtpSchema, registerSchema, refreshTokenSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const authController = new AuthController();

// Send OTP
router.post('/send-otp', validateBody(sendOtpSchema), authController.sendOtp);

// Verify OTP
router.post('/verify-otp', validateBody(verifyOtpSchema), authController.verifyOtp);

// Complete Registration
router.post('/register', validateBody(registerSchema), authController.register);

// Refresh Token
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);

// Logout
router.post('/logout', authenticate, authController.logout);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
