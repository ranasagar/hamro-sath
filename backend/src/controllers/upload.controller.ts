import { Request, Response } from 'express';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { ImageProcessor } from '../utils/imageProcessor';

export class UploadController {
  /**
   * Upload single image
   */
  static async uploadSingle(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Process the uploaded image
    const processedPath = await ImageProcessor.processImage(req.file.path);
    const imageUrl = ImageProcessor.getImageUrl(processedPath, config.baseUrl);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        filename: processedPath.split('/').pop(),
        size: req.file.size,
      },
    });
  }

  /**
   * Upload multiple images
   */
  static async uploadMultiple(req: Request, res: Response): Promise<void> {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    // Process all uploaded images
    const filePaths = req.files.map((file) => file.path);
    const processedPaths = await ImageProcessor.processMultipleImages(filePaths);
    const imageUrls = ImageProcessor.getImageUrls(processedPaths, config.baseUrl);

    res.status(200).json({
      success: true,
      message: `${imageUrls.length} image(s) uploaded successfully`,
      data: {
        urls: imageUrls,
        count: imageUrls.length,
      },
    });
  }
}
