import React from 'react';
import { File, Check, Clock } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

interface FileInfoProps {
  file: File;
  status: 'idle' | 'uploading' | 'success' | 'error';
  dimensions?: { width: number; height: number };
}

const FileInfo: React.FC<FileInfoProps> = ({ file, status, dimensions }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
            <File className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-sm text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Upload status</span>
            {status === 'uploading' && (
              <span className="text-xs text-blue-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" /> Uploading...
              </span>
            )}
            {status === 'success' && (
              <span className="text-xs text-green-500 flex items-center">
                <Check className="h-3 w-3 mr-1" /> Complete
              </span>
            )}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out ${
                status === 'uploading' 
                  ? 'w-2/3 bg-blue-500' 
                  : status === 'success' 
                    ? 'w-full bg-green-500' 
                    : 'w-0'
              }`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div>
            <span className="text-sm text-gray-700">File type</span>
            <p className="text-sm font-medium text-gray-900">{file.type || 'Unknown'}</p>
          </div>
          {dimensions && (
            <div>
              <span className="text-sm text-gray-700">Dimensions</span>
              <p className="text-sm font-medium text-gray-900">
                {dimensions.width} × {dimensions.height} pixels
              </p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-700">Last modified</span>
            <p className="text-sm font-medium text-gray-900">
              {file.lastModified 
                ? new Date(file.lastModified).toLocaleString() 
                : 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileInfo;