import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { generateAltText } from '../utils/accessibilityUtils';
import type { ColorInfo } from '../utils/colorUtils';

interface ImagePreviewProps {
  preview: string | null;
  fileName: string;
  colors: ColorInfo[];
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ preview, fileName, colors }) => {
  const altText = colors.length > 0 ? generateAltText(colors) : "Upload preview area";

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      {preview ? (
        <div className="relative aspect-square w-full">
          <img 
            src={preview} 
            alt={altText}
            className="object-contain w-full h-full p-2"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center aspect-square bg-gray-100">
          <ImageIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

export default ImagePreview;