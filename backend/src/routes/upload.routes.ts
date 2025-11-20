import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { apiLimiter } from '../middleware/rateLimiter';
import { uploadMultiple, uploadSingle } from '../middleware/upload';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Apply rate limiting to uploads
router.use(apiLimiter);

/**
 * @route   POST /api/v1/upload/single
 * @desc    Upload a single image
 * @access  Private
 */
router.post('/single', uploadSingle, asyncHandler(UploadController.uploadSingle));

/**
 * @route   POST /api/v1/upload/multiple
 * @desc    Upload multiple images (max 3)
 * @access  Private
 */
router.post('/multiple', uploadMultiple, asyncHandler(UploadController.uploadMultiple));

export default router;
