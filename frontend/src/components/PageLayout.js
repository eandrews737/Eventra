import React from "react";
import BackButton from "./BackButton";

const PageLayout = ({
  title,
  subtitle,
  children,
  showBackButton = false,
  backButtonProps = {},
  maxWidth = "4xl",
  className = "",
  centerContent = false,
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main
        className={`${maxWidthClasses[maxWidth]} mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 ${
          centerContent ? "min-h-screen flex flex-col justify-center" : ""
        } ${className}`}
      >
        {/* Top right back button */}
        {showBackButton && (
          <div className="flex justify-end mb-4">
            <BackButton {...backButtonProps} />
          </div>
        )}

        {/* Page Title */}
        {(title || subtitle) && (
          <div className="mb-6 sm:mb-8">
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </main>
    </div>
  );
};

export default PageLayout;
