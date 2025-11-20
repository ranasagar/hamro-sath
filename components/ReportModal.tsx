import React, { useEffect, useRef, useState } from 'react';
import { dataUrlToFile, enhanceImage } from '../imageUtils';
import { IssueCategory } from '../types';
import { addGPSWatermarkAuto, verifyNepalGPS } from '../utils/gpsWatermark';
import { CloseIcon } from './Icons';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (data: { category: IssueCategory; description: string; photo: File }) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSubmit }) => {
  const [category, setCategory] = useState<IssueCategory>(IssueCategory.Litter);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [originalPhotoPreview, setOriginalPhotoPreview] = useState<string | null>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Fetching location...');
  const [gpsWatermarkApplied, setGpsWatermarkApplied] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus('Location acquired successfully.'),
      error => {
        console.error('Geolocation error:', error);
        setLocationStatus('Could not get location. Please enable permissions.');
      }
    );
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLocationStatus('Adding GPS watermark...');

      try {
        // Add GPS watermark automatically
        const { file: watermarkedFile, gpsData } = await addGPSWatermarkAuto(file);

        // Verify location is in Nepal
        if (!verifyNepalGPS(gpsData.latitude, gpsData.longitude)) {
          alert(
            'Warning: Location detected outside Nepal. Please ensure you are reporting from within Nepal.'
          );
        }

        setPhoto(watermarkedFile);
        setGpsWatermarkApplied(true);
        setGpsLocation(`${gpsData.latitude.toFixed(6)}, ${gpsData.longitude.toFixed(6)}`);
        setLocationStatus('GPS watermark added successfully ✓');
        setIsEnhanced(false);

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPhotoPreview(result);
          setOriginalPhotoPreview(result);
        };
        reader.readAsDataURL(watermarkedFile);
      } catch (error) {
        console.error('GPS watermark error:', error);
        setLocationStatus('GPS unavailable. Using photo without watermark.');

        // Fallback: use original file without watermark
        setPhoto(file);
        setGpsWatermarkApplied(false);
        setIsEnhanced(false);

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPhotoPreview(result);
          setOriginalPhotoPreview(result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleEnhance = async () => {
    if (!photoPreview) return;
    try {
      const enhancedDataUrl = await enhanceImage(photoPreview);
      setPhotoPreview(enhancedDataUrl);
      setIsEnhanced(true);
    } catch (error) {
      console.error('Image enhancement failed:', error);
      alert('Sorry, there was an error enhancing the image.');
    }
  };

  const handleRevert = () => {
    if (originalPhotoPreview) {
      setPhotoPreview(originalPhotoPreview);
      setIsEnhanced(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo && !photoPreview) {
      alert('Please upload a photo of the issue.');
      return;
    }
    setIsSubmitting(true);

    let finalPhoto: File;
    if (isEnhanced && photoPreview) {
      finalPhoto = await dataUrlToFile(photoPreview, photo?.name || 'enhanced_report.jpg');
    } else if (photo) {
      finalPhoto = photo;
    } else {
      setIsSubmitting(false);
      return;
    }

    onSubmit({ category, description, photo: finalPhoto });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-scale-in">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-green-dark">Report an Issue</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as IssueCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
              >
                {Object.values(IssueCategory).map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Brief Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
                placeholder="e.g., Dustbin near the corner is overflowing."
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Photo (Before)
              </label>
              <div
                onClick={triggerFileSelect}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-brand-green"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="max-h-40 rounded-lg" />
                ) : (
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">Click to upload an image</p>
                    <p className="text-xs text-gray-500">PNG or JPG</p>
                  </div>
                )}
              </div>
              <input
                id="file-upload"
                ref={fileInputRef}
                name="file-upload"
                type="file"
                accept="image/png, image/jpeg"
                className="sr-only"
                onChange={handleFileChange}
              />
              <div className="mt-2 space-x-2 text-center">
                {photoPreview && !isEnhanced && (
                  <button
                    type="button"
                    onClick={handleEnhance}
                    className="text-sm font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200"
                  >
                    ✨ Enhance Image
                  </button>
                )}
                {photoPreview && isEnhanced && (
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="text-sm font-semibold bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                  >
                    Revert
                  </button>
                )}
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">{locationStatus}</p>
              {gpsWatermarkApplied && gpsLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-xs text-green-800 font-medium">
                    📍 GPS Verified: {gpsLocation}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Photo authenticated with location and timestamp
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!photo || isSubmitting}
              className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
