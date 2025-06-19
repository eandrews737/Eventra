import React from "react";
import { Link, useNavigate } from "react-router-dom";

const BackButton = ({ 
  to, 
  text = "Back to Events", 
  variant = "text", 
  className = "",
  showText = true
}) => {
  const navigate = useNavigate();

  const baseClasses = "inline-flex items-center space-x-2 transition-all duration-200";
  
  const variants = {
    text: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
    button: "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    primary: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200",
    logo: "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  // U-turn arrow SVG
  const UTurnArrow = () => (
    <svg 
      className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2.5} 
        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
      />
    </svg>
  );

  if (variant === "logo") {
    if (to) {
      return (
        <Link to={to} className={classes} title={text}>
          <UTurnArrow />
          {showText && <span className="sr-only">{text}</span>}
        </Link>
      );
    }
    return (
      <button onClick={() => navigate(-1)} className={classes} title={text}>
        <UTurnArrow />
        {showText && <span className="sr-only">{text}</span>}
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {showText && <span>{text}</span>}
      </Link>
    );
  }

  return (
    <button onClick={() => navigate(-1)} className={classes}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {showText && <span>{text}</span>}
    </button>
  );
};

export default BackButton; 