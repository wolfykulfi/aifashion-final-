import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { ColorInfo } from '../utils/colorUtils';
import { generateFashionDescription, speakResults } from '../utils/accessibilityUtils';

interface ColorPaletteProps {
  colors: ColorInfo[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const sortedColors = [...colors].sort((a, b) => b.percentage - a.percentage);
  const fashionDescription = generateFashionDescription(colors);

  const handleSpeak = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakResults(fashionDescription);
      speechSynthesis.addEventListener('end', () => setIsSpeaking(false), { once: true });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Color Palette</h3>
        <button
          onClick={handleSpeak}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label={isSpeaking ? "Stop speaking" : "Speak color analysis"}
        >
          {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      <p className="text-sm text-gray-600" role="status" aria-live="polite">
        {fashionDescription}
      </p>

      <div className="grid gap-3">
        {sortedColors.map((color, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg shadow-inner"
              style={{ backgroundColor: color.hex }}
              role="img"
              aria-label={`${color.name} color swatch`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {color.name}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">{color.hex}</p>
                <span className="text-gray-300">•</span>
                <p className="text-sm text-gray-500">{color.percentage}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;