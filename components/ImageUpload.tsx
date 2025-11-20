import React, { useRef, useState } from 'react';
import { useUpload } from '../hooks/useUpload';

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  currentImage?: string;
  accept?: string;
  maxSize?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
  currentImage,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize = 5,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { uploading, progress, error, uploadSingle, validateFile, reset } = useUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      if (onUploadError) onUploadError(validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const result = await uploadSingle(file);
    if (result) {
      onUploadComplete(result.url);
    } else if (error) {
      if (onUploadError) onUploadError(error);
      setPreview(currentImage || null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover rounded-lg"
          />
          {!uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                onClick={handleClick}
                className="bg-white text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Change
              </button>
              <button
                onClick={handleRemove}
                className="bg-red-500 text-white px-4 py-2 rounded-md font-medium hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex flex-col items-center justify-center">
              <div className="w-3/4 bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-brand-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-white text-sm font-medium">{progress.percentage}%</span>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={uploading}
          className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-green transition-colors flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="text-sm text-gray-600 font-medium">
            {uploading ? 'Uploading...' : 'Click to upload image'}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Max {maxSize}MB (JPEG, PNG, WebP)
          </span>
        </button>
      )}

      {error && !uploading && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
