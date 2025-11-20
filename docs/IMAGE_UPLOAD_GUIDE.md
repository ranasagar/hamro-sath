# Image Upload Components - Usage Guide

## Overview
Three components for handling image uploads with progress tracking, validation, and Cloudinary integration.

## Components

### 1. useUpload Hook
Custom React hook for file uploads with progress tracking and validation.

```typescript
import { useUpload } from '../hooks/useUpload';

const MyComponent = () => {
  const { uploading, progress, error, uploadSingle, validateFile } = useUpload();

  const handleUpload = async (file: File) => {
    const result = await uploadSingle(file);
    if (result) {
      console.log('Uploaded:', result.url);
    }
  };
};
```

**Features:**
- Single and multiple file upload
- Progress tracking (loaded, total, percentage)
- File validation (type, size)
- Error handling

### 2. ImageUpload Component
Single image upload with preview and controls.

```typescript
import ImageUpload from '../components/ImageUpload';

const ProfilePicture = () => {
  const [avatarUrl, setAvatarUrl] = useState('');

  return (
    <ImageUpload
      onUploadComplete={(url) => setAvatarUrl(url)}
      onUploadError={(error) => console.error(error)}
      currentImage={avatarUrl}
      className="w-32 h-32"
    />
  );
};
```

**Props:**
- `onUploadComplete`: (url: string) => void - Called when upload succeeds
- `onUploadError?`: (error: string) => void - Called on errors
- `currentImage?`: string - Existing image URL
- `accept?`: string - File types (default: image/jpeg,image/jpg,image/png,image/webp)
- `maxSize?`: number - Max size in MB (default: 5)
- `className?`: string - CSS classes

**Features:**
- Click to select file
- Image preview
- Change/Remove buttons on hover
- Upload progress bar
- File validation

### 3. MultiImageUpload Component
Multiple image upload (up to 3 images).

```typescript
import MultiImageUpload from '../components/MultiImageUpload';

const IssueReport = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  return (
    <MultiImageUpload
      onUploadComplete={(urls) => setImageUrls(urls)}
      onUploadError={(error) => toast.error(error)}
      maxFiles={3}
      className="mt-4"
    />
  );
};
```

**Props:**
- `onUploadComplete`: (urls: string[]) => void - Called when uploads complete
- `onUploadError?`: (error: string) => void - Called on errors
- `maxFiles?`: number - Max number of files (default: 3)
- `className?`: string - CSS classes

**Features:**
- Multiple file selection
- Grid preview layout
- Remove individual images
- Add more images up to limit
- Clear all button
- Batch upload with progress

## Usage Examples

### Profile Page - Avatar Upload
```typescript
const ProfilePage = () => {
  const { updateProfile } = useUser();

  return (
    <div className="flex flex-col items-center">
      <ImageUpload
        onUploadComplete={async (url) => {
          await updateProfile({ avatar_url: url });
        }}
        currentImage={user?.avatar_url}
        className="w-32 h-32 rounded-full overflow-hidden"
      />
    </div>
  );
};
```

### Issue Report - Multiple Images
```typescript
const ReportModal = () => {
  const [formData, setFormData] = useState({ images: [] });

  return (
    <form>
      <MultiImageUpload
        onUploadComplete={(urls) => setFormData({ ...formData, images: urls })}
        maxFiles={3}
      />
    </form>
  );
};
```

### Product/Merchandise - Single Image
```typescript
const MerchandiseForm = () => {
  return (
    <ImageUpload
      onUploadComplete={(url) => handleImageUpload(url)}
      accept="image/jpeg,image/png"
      maxSize={2}
      className="w-64 h-64"
    />
  );
};
```

## Validation

### File Type
Only JPEG, PNG, and WebP images allowed.

### File Size
Maximum 5MB per file (configurable).

### Number of Files
- ImageUpload: 1 file
- MultiImageUpload: Up to 3 files (configurable)

## Error Handling

```typescript
<ImageUpload
  onUploadComplete={(url) => console.log('Success:', url)}
  onUploadError={(error) => {
    // Handle errors
    if (error.includes('size')) {
      toast.error('File too large! Max 5MB');
    } else if (error.includes('type')) {
      toast.error('Invalid file type! Use JPEG, PNG, or WebP');
    } else {
      toast.error('Upload failed. Please try again.');
    }
  }}
/>
```

## Backend Integration

The upload components automatically use the configured backend endpoint:
- **Endpoint:** `/api/v1/upload`
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Authentication:** Bearer token (auto-attached)

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "upload": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "abc123",
      "format": "jpg",
      "width": 800,
      "height": 600,
      "bytes": 123456
    }
  }
}
```

## Cloudinary Configuration

Backend automatically handles:
- Image upload to Cloudinary
- Resize to 800x600
- WebP conversion (85% quality)
- Compression

No frontend configuration needed!

## Styling

All components use Tailwind CSS classes and can be customized:

```typescript
<ImageUpload
  className="w-full h-64 rounded-xl shadow-lg"
  // Component inherits these styles
/>
```

## Testing

```typescript
// Test file validation
const { validateFile } = useUpload();
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const result = validateFile(file);
console.log(result); // { valid: true }

// Test invalid file
const largeFile = new File([new Blob([new ArrayBuffer(6 * 1024 * 1024)])], 'large.jpg');
const result2 = validateFile(largeFile);
console.log(result2); // { valid: false, error: 'File size must be less than 5MB' }
```

## Notes

- Uploads are automatically authenticated using JWT tokens
- Progress tracking works in real-time
- Failed uploads don't leave broken state
- Components are fully accessible (keyboard navigation, screen readers)
- Preview uses FileReader API (client-side, instant)
- Actual upload happens asynchronously
