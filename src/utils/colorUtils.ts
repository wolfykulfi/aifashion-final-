import ColorThief from 'colorthief';
import nearestColor from 'nearest-color';

// Refined color name mapping with fashion-focused colors
const colorNames = {
  // Core colors
  black: '#000000',
  white: '#FFFFFF',
  
  // Neutrals
  ivory: '#FFFFF0',
  cream: '#FFFDD0',
  beige: '#F5F5DC',
  khaki: '#C3B091',
  tan: '#D2B48C',
  brown: '#964B00',
  
  // Grays
  silver: '#C0C0C0',
  gray: '#808080',
  charcoal: '#36454F',
  
  // Blues
  navy: '#000080',
  royalblue: '#4169E1',
  blue: '#0000FF',
  lightblue: '#ADD8E6',
  skyblue: '#87CEEB',
  powderblue: '#B0E0E6',
  
  // Reds
  burgundy: '#800020',
  maroon: '#800000',
  red: '#FF0000',
  crimson: '#DC143C',
  coral: '#FF7F50',
  
  // Greens
  forestgreen: '#228B22',
  green: '#008000',
  olive: '#808000',
  sage: '#BCB88A',
  mint: '#98FF98',
  
  // Purples
  purple: '#800080',
  plum: '#8E4585',
  violet: '#8F00FF',
  lavender: '#E6E6FA',
  
  // Pinks
  magenta: '#FF00FF',
  fuchsia: '#FF00FF',
  pink: '#FFC0CB',
  rose: '#FF007F',
  
  // Yellows
  gold: '#FFD700',
  yellow: '#FFFF00',
  
  // Oranges
  orange: '#FFA500',
  peach: '#FFE5B4',
  
  // Fashion metallics
  bronze: '#CD7F32',
  copper: '#B87333',
};

const getColorName = nearestColor.from(colorNames);

export interface ColorInfo {
  hex: string;
  name: string;
  percentage: number;
}

export const analyzeColors = async (imageUrl: string): Promise<ColorInfo[]> => {
  const colorThief = new ColorThief();
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        // Get a larger palette for more accurate color detection
        const palette = colorThief.getPalette(img, 12);
        if (!palette || palette.length === 0) {
          return reject(new Error('No colors found in image.'));
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));
        
        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

        // Enhanced color distance calculation using LAB color space
        function rgbToLab(r: number, g: number, b: number) {
          // Convert RGB to XYZ
          let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
          let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
          let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

          // Normalize for D65 white point
          x /= 95.047;
          y /= 100;
          z /= 108.883;

          x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
          y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
          z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

          return [
            (116 * y) - 16, // L
            500 * (x - y),  // a
            200 * (y - z)   // b
          ];
        }

        function colorDistance(rgb1: number[], rgb2: number[]) {
          const lab1 = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
          const lab2 = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);
          
          // Calculate Euclidean distance in LAB space
          return Math.sqrt(
            Math.pow(lab1[0] - lab2[0], 2) +
            Math.pow(lab1[1] - lab2[1], 2) +
            Math.pow(lab1[2] - lab2[2], 2)
          );
        }

        // Count pixels closest to each palette color
        const counts = new Array(palette.length).fill(0);
        let totalPixels = 0;
        
        // Sample pixels for better performance
        const sampleRate = 4; // Sample every 4th pixel
        for (let i = 0; i < imageData.length; i += 4 * sampleRate) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];
          
          // Skip transparent pixels
          if (a < 128) continue;
          
          // Skip very light (close to white) and very dark (close to black) pixels
          const brightness = (r + g + b) / 3;
          if (brightness > 250 || brightness < 5) continue;
          
          totalPixels++;
          
          // Find closest palette color
          let minDist = Infinity;
          let minIdx = 0;
          for (let j = 0; j < palette.length; j++) {
            const dist = colorDistance([r, g, b], palette[j]);
            if (dist < minDist) {
              minDist = dist;
              minIdx = j;
            }
          }
          counts[minIdx]++;
        }

        // Convert to hex and get percentages
        const colors = palette.map((color, index) => {
          const [r, g, b] = color;
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          const name = getColorName(hex).name;
          const percentage = totalPixels > 0 ? Math.round((counts[index] / totalPixels) * 100) : 0;
          return {
            hex,
            name,
            percentage
          };
        })
        // Filter out colors with very low percentages and normalize
        .filter(color => color.percentage > 1)
        .sort((a, b) => b.percentage - a.percentage);

        // Normalize percentages to total 100%
        const totalPercentage = colors.reduce((sum, color) => sum + color.percentage, 0);
        colors.forEach(color => {
          color.percentage = Math.round((color.percentage / totalPercentage) * 100);
        });

        resolve(colors);
      } catch (error) {
        reject(new Error('Failed to analyze colors'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image for color analysis'));
    img.src = imageUrl;
  });
};