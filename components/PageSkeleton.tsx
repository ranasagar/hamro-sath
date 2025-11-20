import React from 'react';

interface PageSkeletonProps {
  variant?: 'home' | 'list' | 'profile' | 'form';
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant = 'home' }) => {
  const shimmer = 'animate-pulse bg-gray-200';

  if (variant === 'home') {
    return (
      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className={`h-48 rounded-lg ${shimmer}`} />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-24 rounded-lg ${shimmer}`} />
          ))}
        </div>

        {/* Content List */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className={`h-6 w-3/4 rounded ${shimmer}`} />
            <div className={`h-20 rounded-lg ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className={`h-8 w-1/2 rounded ${shimmer}`} />
        
        {/* List Items */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full ${shimmer}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-3/4 rounded ${shimmer}`} />
              <div className={`h-3 w-1/2 rounded ${shimmer}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="p-4 space-y-6">
        {/* Avatar and Name */}
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-24 h-24 rounded-full ${shimmer}`} />
          <div className={`h-6 w-32 rounded ${shimmer}`} />
          <div className={`h-4 w-48 rounded ${shimmer}`} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-20 rounded-lg ${shimmer}`} />
          ))}
        </div>

        {/* Content Sections */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className={`h-6 w-1/3 rounded ${shimmer}`} />
            <div className={`h-32 rounded-lg ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Title */}
        <div className={`h-8 w-2/3 rounded ${shimmer}`} />
        
        {/* Form Fields */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={`h-4 w-1/4 rounded ${shimmer}`} />
            <div className={`h-10 rounded ${shimmer}`} />
          </div>
        ))}

        {/* Submit Button */}
        <div className={`h-12 rounded-lg ${shimmer}`} />
      </div>
    );
  }

  return null;
};

export default PageSkeleton;
