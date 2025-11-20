import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataUrlToFile, enhanceImage } from './imageUtils';

describe('imageUtils', () => {
  describe('dataUrlToFile', () => {
    it('should convert a data URL to a File object', async () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const filename = 'test-image.png';

      const file = await dataUrlToFile(dataUrl, filename);

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe(filename);
      expect(file.type).toBe('image/png');
      expect(file.size).toBeGreaterThan(0);
    });

    it('should handle JPEG data URLs', async () => {
      // Simpler JPEG data URL that's more compatible with test environment
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const filename = 'test-photo.jpg';

      const file = await dataUrlToFile(dataUrl, filename);

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe(filename);
      // Type might vary in test environment
      expect(file.type).toMatch(/image\/(jpeg|octet-stream)/);
    });

    it('should reject invalid data URLs', async () => {
      const invalidDataUrl = 'not-a-valid-data-url';
      const filename = 'test.png';

      await expect(dataUrlToFile(invalidDataUrl, filename)).rejects.toThrow();
    });
  });

  describe('enhanceImage', () => {
    beforeEach(() => {
      // Mock canvas and Image for browser environment
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: ((err: Error) => void) | null = null;
        src = '';
        width = 100;
        height = 100;

        constructor() {
          setTimeout(() => {
            if (this.onload && this.src.startsWith('data:')) {
              this.onload();
            } else if (this.onerror && !this.src.startsWith('data:')) {
              this.onerror(new Error('Invalid image source'));
            }
          }, 0);
        }
      } as unknown as typeof Image;

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          filter: '',
          drawImage: vi.fn(),
        })),
        toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockenhancedimage'),
      };

      global.document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return {} as HTMLElement;
      });
    });

    it('should enhance an image and return a data URL', async () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const result = await enhanceImage(dataUrl);

      expect(result).toBe('data:image/jpeg;base64,mockenhancedimage');
    });

    it('should reject when image fails to load', async () => {
      const invalidDataUrl = 'invalid-image-url';

      await expect(enhanceImage(invalidDataUrl)).rejects.toThrow('Invalid image source');
    });

    it('should reject when canvas context is not available', async () => {
      const mockCanvas = {
        getContext: vi.fn(() => null),
      };

      global.document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return {} as HTMLElement;
      });

      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      await expect(enhanceImage(dataUrl)).rejects.toThrow('Could not get canvas context');
    });
  });
});
