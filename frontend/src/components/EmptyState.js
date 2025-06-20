import React from "react";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow rounded-lg p-8 sm:p-12 text-center ${className}`}
    >
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      )}
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
