import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';
import { processImage, analyzeImageColors } from '../utils/imageUtils';
import type { ProcessedImage } from '../utils/imageUtils';
import { ColorInfo } from '../utils/colorUtils';
import ImagePreview from './ImagePreview';
import FileInfo from './FileInfo';
import ColorPalette from './ColorPalette';

const ImageUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | undefined>(undefined);
  const [colors, setColors] = useState<ColorInfo[]>([]);

  const handleFileChange = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;
    try {
      setError(null);
      setUploadStatus('uploading');
      const processed: ProcessedImage = await processImage(selectedFile);
      setFile(processed.file);
      setPreview(processed.preview);
      setDimensions(processed.dimensions);
      const colorPalette = await analyzeImageColors(processed.preview);
      setColors(colorPalette);
      setTimeout(() => {
        setUploadStatus('success');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setUploadStatus('error');
      setFile(null);
      setPreview(null);
      setDimensions(undefined);
      setColors([]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setUploadStatus('idle');
    setError(null);
    setDimensions(undefined);
    setColors([]);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 transition-all duration-300" role="main">
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-start gap-3\" role="alert">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5\" aria-hidden="true" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg transition-all duration-300 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Drop zone for uploading images"
        >
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-blue-500" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drag and drop your image</h3>
            <p className="text-sm text-gray-500 mb-4">or click to browse your files</p>
            <label className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
              Select Image
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
                aria-label="Choose an image file to upload"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Fashion Analysis</h3>
            <button 
              onClick={handleReset}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Remove image and start over"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ImagePreview preview={preview} fileName={file.name} colors={colors} />
              <FileInfo file={file} status={uploadStatus} dimensions={dimensions} />
            </div>
            <ColorPalette colors={colors} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;