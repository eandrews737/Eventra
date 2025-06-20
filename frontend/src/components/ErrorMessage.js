import React from "react";

const ErrorMessage = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div
      className={`bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md ${className}`}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
