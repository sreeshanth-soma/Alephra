/**
 * Image Optimization Utility
 * Compresses and optimizes images before upload to reduce bandwidth and processing time
 */

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Optimizes an image file by resizing and compressing
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Optimized image as base64 string
 */
export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image smoothing for quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized base64
        const optimizedBase64 = canvas.toDataURL(format, quality);
        
        console.log(
          `[ImageOptimizer] Original: ${(file.size / 1024).toFixed(2)}KB, ` +
          `Optimized: ${(optimizedBase64.length * 0.75 / 1024).toFixed(2)}KB, ` +
          `Dimensions: ${width}x${height}`
        );

        resolve(optimizedBase64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Determines optimal compression settings based on file size
 * Larger files get more aggressive compression
 */
export function getOptimalCompressionSettings(fileSizeBytes: number): OptimizeImageOptions {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  if (fileSizeMB > 5) {
    // Very large files: aggressive compression
    return {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.7,
      format: 'image/jpeg',
    };
  } else if (fileSizeMB > 2) {
    // Large files: moderate compression
    return {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.8,
      format: 'image/jpeg',
    };
  } else {
    // Small files: minimal compression
    return {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.85,
      format: 'image/jpeg',
    };
  }
}

/**
 * Batch optimizes multiple images
 */
export async function optimizeImages(
  files: File[],
  options?: OptimizeImageOptions
): Promise<string[]> {
  // Process all images in parallel for better performance
  return Promise.all(
    files.map(file => {
      const opts = options || getOptimalCompressionSettings(file.size);
      return optimizeImage(file, opts);
    })
  );
}
