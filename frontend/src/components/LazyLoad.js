import React, { useState, useRef, useEffect } from 'react';

const LazyLoad = ({ 
  children, 
  placeholder = null, 
  threshold = 0.1, 
  rootMargin = '50px',
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setHasLoaded(true);
  };

  return (
    <div ref={elementRef} className={className}>
      {!isVisible && placeholder}
      {isVisible && (
        <div onLoad={handleLoad}>
          {children}
        </div>
      )}
    </div>
  );
};

export default LazyLoad; 