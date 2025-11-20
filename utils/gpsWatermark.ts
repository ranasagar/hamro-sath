/**
 * GPS Watermarking Utility
 * Adds GPS coordinates and timestamp watermark to uploaded photos
 */

interface GPSData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface WatermarkOptions {
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  padding?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Get current GPS coordinates
 */
export const getCurrentGPS = (): Promise<GPSData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        });
      },
      error => {
        reject(new Error(`GPS Error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Format GPS coordinates for display
 */
const formatGPS = (lat: number, lon: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lon).toFixed(6)}°${lonDir}`;
};

/**
 * Format timestamp for display
 */
const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

/**
 * Add GPS watermark to image
 */
export const addGPSWatermark = async (
  file: File,
  gpsData: GPSData,
  options: WatermarkOptions = {}
): Promise<File> => {
  const {
    fontSize = 14,
    fontFamily = 'Arial, sans-serif',
    textColor = '#FFFFFF',
    backgroundColor = 'rgba(0, 0, 0, 0.7)',
    padding = 10,
    position = 'bottom-right',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Prepare watermark text
          const gpsText = formatGPS(gpsData.latitude, gpsData.longitude);
          const timeText = formatTimestamp(gpsData.timestamp);
          const accuracyText = `±${gpsData.accuracy.toFixed(0)}m`;

          // Set font
          ctx.font = `${fontSize}px ${fontFamily}`;

          // Measure text
          const gpsWidth = ctx.measureText(gpsText).width;
          const timeWidth = ctx.measureText(timeText).width;
          const accuracyWidth = ctx.measureText(accuracyText).width;
          const maxWidth = Math.max(gpsWidth, timeWidth, accuracyWidth);

          const lineHeight = fontSize * 1.5;
          const boxWidth = maxWidth + padding * 2;
          const boxHeight = lineHeight * 3 + padding * 2;

          // Calculate position
          let x, y;
          switch (position) {
            case 'bottom-right':
              x = canvas.width - boxWidth - 10;
              y = canvas.height - boxHeight - 10;
              break;
            case 'bottom-left':
              x = 10;
              y = canvas.height - boxHeight - 10;
              break;
            case 'top-right':
              x = canvas.width - boxWidth - 10;
              y = 10;
              break;
            case 'top-left':
              x = 10;
              y = 10;
              break;
          }

          // Draw background box
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(x, y, boxWidth, boxHeight);

          // Draw border
          ctx.strokeStyle = textColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, boxWidth, boxHeight);

          // Draw text
          ctx.fillStyle = textColor;
          ctx.textBaseline = 'top';

          // GPS icon + coordinates
          ctx.fillText('📍 ' + gpsText, x + padding, y + padding);

          // Timestamp
          ctx.fillText('🕐 ' + timeText, x + padding, y + padding + lineHeight);

          // Accuracy
          ctx.fillText('📏 ' + accuracyText, x + padding, y + padding + lineHeight * 2);

          // Convert canvas to blob
          canvas.toBlob(
            blob => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }

              // Create new file with watermark
              const watermarkedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(watermarkedFile);
            },
            file.type,
            0.95
          ); // 95% quality
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Add GPS watermark with automatic GPS fetch
 */
export const addGPSWatermarkAuto = async (
  file: File,
  options?: WatermarkOptions
): Promise<{ file: File; gpsData: GPSData }> => {
  try {
    const gpsData = await getCurrentGPS();
    const watermarkedFile = await addGPSWatermark(file, gpsData, options);
    return { file: watermarkedFile, gpsData };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify GPS coordinates are within Nepal's boundaries
 */
export const verifyNepalGPS = (latitude: number, longitude: number): boolean => {
  // Nepal's approximate boundaries
  const NEPAL_BOUNDS = {
    minLat: 26.3,
    maxLat: 30.5,
    minLon: 80.0,
    maxLon: 88.3,
  };

  return (
    latitude >= NEPAL_BOUNDS.minLat &&
    latitude <= NEPAL_BOUNDS.maxLat &&
    longitude >= NEPAL_BOUNDS.minLon &&
    longitude <= NEPAL_BOUNDS.maxLon
  );
};

/**
 * Get address from GPS coordinates using reverse geocoding
 * (You'll need to integrate with a geocoding API like Google Maps or OpenStreetMap)
 */
export const getAddressFromGPS = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Using OpenStreetMap Nominatim (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Location unavailable';
  }
};
