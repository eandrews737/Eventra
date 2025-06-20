import React from "react";

const LoadingSpinner = ({ size = "large", className = "" }) => {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-16 w-16",
    large: "h-32 w-32",
  };

  return (
    <div
      data-testid="loading-spinner"
      className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
