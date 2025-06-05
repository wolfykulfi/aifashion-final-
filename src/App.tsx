import React from 'react';
import ImageUploader from './components/ImageUploader';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">AI FASHION ANALYSIS</h1>
        <ImageUploader />
      </div>
    </div>
  );
}

export default App;