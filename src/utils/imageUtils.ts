import imageCompression from 'browser-image-compression';
import { detectClothingItems, CLOTHING_LABELS } from './visionUtils';
import { analyzeColors } from './colorUtils';

export interface ProcessedImage {
  file: File;
  preview: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export const processImage = async (file: File): Promise<ProcessedImage> => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }

  // Compression options
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  try {
    // Compress the image
    const compressedFile = await imageCompression(file, options);
    
    // Generate preview URL
    const preview = await imageCompression.getDataUrlFromFile(compressedFile);
    
    // Get image dimensions
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => reject(new Error('Failed to load image dimensions'));
      img.src = preview;
    });

    return {
      file: compressedFile,
      preview,
      dimensions
    };
  } catch (error) {
    throw new Error('Failed to process image. Please try again.');
  }
};

export const analyzeImageColors = async (preview: string): Promise<{ name: string; hex: string; percentage: number }[]> => {
  const img = new Image();
  img.src = preview;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // Get clothing items from Vision API
  const base64Image = preview.split(',')[1];
  const detectedObjects = await detectClothingItems(base64Image);
  
  // Filter for clothing items
  const clothingItems = detectedObjects.filter(obj => 
    CLOTHING_LABELS.includes(obj.name)
  );

  if (clothingItems.length === 0) {
    // If no clothing items detected, analyze the whole image
    return analyzeColors(preview);
  }

  // Create a new canvas for the clothing items only
  const clothingCanvas = document.createElement('canvas');
  const clothingCtx = clothingCanvas.getContext('2d');
  if (!clothingCtx) throw new Error('Failed to get canvas context');

  clothingCanvas.width = img.width;
  clothingCanvas.height = img.height;

  // Draw only the clothing items
  clothingItems.forEach(item => {
    const box = item.boundingPoly.normalizedVertices;
    const x = box[0].x * img.width;
    const y = box[0].y * img.height;
    const width = (box[2].x - box[0].x) * img.width;
    const height = (box[2].y - box[0].y) * img.height;
    
    clothingCtx.drawImage(img, x, y, width, height, x, y, width, height);
  });

  // Convert the clothing-only canvas to a data URL
  const clothingPreview = clothingCanvas.toDataURL('image/jpeg');
  
  // Analyze colors of the clothing items
  return analyzeColors(clothingPreview);
};