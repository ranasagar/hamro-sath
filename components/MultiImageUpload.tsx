import React, { useRef, useState } from 'react';
import { useUpload } from '../hooks/useUpload';

interface MultiImageUploadProps {
  onUploadComplete: (imageUrls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 3,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const { uploading, progress, error, uploadMultiple, validateFiles, reset } = useUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validation = validateFiles(files);
    if (!validation.valid) {
      if (onUploadError) onUploadError(validation.error || 'Invalid files');
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    // Upload files
    const results = await uploadMultiple(files);
    if (results.length > 0) {
      const urls = results.map((r) => r.url);
      setUploadedUrls(urls);
      onUploadComplete(urls);
    } else if (error) {
      if (onUploadError) onUploadError(error);
      setPreviews([]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    setUploadedUrls(newUrls);
    onUploadComplete(newUrls);
  };

  const handleClearAll = () => {
    setPreviews([]);
    setUploadedUrls([]);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadComplete([]);
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {previews.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                {!uploading && (
                  <button
                    onClick={() => handleRemove(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {uploading && (
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-brand-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-600">
                Uploading {previews.length} image{previews.length > 1 ? 's' : ''}... {progress.percentage}%
              </p>
            </div>
          )}

          {!uploading && (
            <div className="flex gap-2">
              {previews.length < maxFiles && (
                <button
                  onClick={handleClick}
                  className="flex-1 bg-brand-green text-white py-2 px-4 rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
                >
                  Add More ({previews.length}/{maxFiles})
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-green transition-colors flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-600 font-medium mb-1">
            Click to upload images
          </span>
          <span className="text-xs text-gray-500">
            Up to {maxFiles} images, max 5MB each
          </span>
        </button>
      )}

      {error && !uploading && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default MultiImageUpload;
