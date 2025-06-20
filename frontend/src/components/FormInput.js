import React from "react";

const FormInput = ({
  label,
  id,
  name,
  type = "text",
  required = false,
  placeholder,
  value,
  onChange,
  rows,
  min,
  className = "",
  ...props
}) => {
  const baseInputClasses =
    "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";
  const baseLabelClasses =
    "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={baseLabelClasses}>
          {label} {required && "*"}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={rows || 4}
          required={required}
          className={baseInputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          required={required}
          min={min}
          className={baseInputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      )}
    </div>
  );
};

export default FormInput;
