import React from 'react';

function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizes[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`}></div>
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  );
}

export default LoadingSpinner;