import React from "react";

const FormSection = ({ title, children, className = "" }) => {
  return (
    <div className={`${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">{children}</div>
    </div>
  );
};

export default FormSection;
