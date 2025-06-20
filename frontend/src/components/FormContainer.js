import React from "react";

const FormContainer = ({ children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg ${className}`}>
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">{children}</div>
    </div>
  );
};

export default FormContainer;
