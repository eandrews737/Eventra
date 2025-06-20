import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "medium",
  className = "",
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variantClasses = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    success:
      "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    warning:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    danger: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    primary: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    info: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
  };

  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-2.5 py-0.5 text-xs",
    large: "px-3 py-1 text-sm",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return <span className={classes}>{children}</span>;
};

export default Badge;
