import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logger } from './logger';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageProcessor {
  private static readonly DEFAULT_WIDTH = 800;
  private static readonly DEFAULT_HEIGHT = 600;
  private static readonly DEFAULT_QUALITY = 85;
  private static readonly DEFAULT_FORMAT = 'webp';

  /**
   * Process and optimize image
   */
  static async processImage(
    inputPath: string,
    options: ImageProcessingOptions = {}
  ): Promise<string> {
    try {
      const {
        width = this.DEFAULT_WIDTH,
        height = this.DEFAULT_HEIGHT,
        quality = this.DEFAULT_QUALITY,
        format = this.DEFAULT_FORMAT,
      } = options;

      // Generate output path
      const ext = path.extname(inputPath);
      const outputPath = inputPath.replace(ext, `-processed.${format}`);

      // Process image
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'inside', // Maintain aspect ratio, fit within dimensions
          withoutEnlargement: true, // Don't upscale smaller images
        })
        .toFormat(format, { quality })
        .toFile(outputPath);

      // Delete original file
      fs.unlinkSync(inputPath);

      logger.info('Image processed successfully', {
        input: inputPath,
        output: outputPath,
        width,
        height,
        quality,
        format,
      });

      return outputPath;
    } catch (error) {
      logger.error('Image processing error:', { inputPath, error });
      throw error;
    }
  }

  /**
   * Process multiple images
   */
  static async processMultipleImages(
    inputPaths: string[],
    options: ImageProcessingOptions = {}
  ): Promise<string[]> {
    const processedPaths: string[] = [];

    for (const inputPath of inputPaths) {
      try {
        const outputPath = await this.processImage(inputPath, options);
        processedPaths.push(outputPath);
      } catch (error) {
        logger.error('Failed to process image:', { inputPath, error });
        // Continue processing other images even if one fails
      }
    }

    return processedPaths;
  }

  /**
   * Delete image file
   */
  static async deleteImage(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('Image deleted successfully', { filePath });
      }
    } catch (error) {
      logger.error('Failed to delete image:', { filePath, error });
    }
  }

  /**
   * Get image URL from file path
   */
  static getImageUrl(filePath: string, baseUrl: string): string {
    const filename = path.basename(filePath);
    return `${baseUrl}/uploads/${filename}`;
  }

  /**
   * Get multiple image URLs
   */
  static getImageUrls(filePaths: string[], baseUrl: string): string[] {
    return filePaths.map((filePath) => this.getImageUrl(filePath, baseUrl));
  }
}
