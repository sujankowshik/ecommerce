import React from 'react';

const Rating = ({ value = 0, text = '', onChange = null, size = 5 }) => {
  const stars = [1, 2, 3, 4, 5];

  const renderStar = (starVal) => {
    const isInteractive = onChange !== null;
    const isFilled = value >= starVal;
    const isHalf = value >= starVal - 0.5 && value < starVal;

    const handleClick = () => {
      if (isInteractive) {
        onChange(starVal);
      }
    };

    return (
      <span
        key={starVal}
        onClick={handleClick}
        className={`${isInteractive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
      >
        <svg
          className={`w-${size} h-${size} inline-block mr-0.5`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          {isFilled ? (
            // Full Star
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          ) : isHalf ? (
            // Half Star (using clipping mask or custom paths, or standard shaded yellow)
            <g fill="currentColor">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                className="text-slate-200 dark:text-slate-800"
              />
              <path
                d="M10 15v-12.07l-1.07 3.292a1 1 0 01-.95.69h-3.46c-.97 0-1.37 1.24-.59 1.81l2.8 2.03c.31.23.44.64.36 1.12l-1.07 3.29c-.3.92.76 1.69 1.54 1.12l2.8-2.03a1 1 0 011.17 0l2.8 2.03c.78.57 1.84-.2 1.54-1.12l-1.07-3.29a1 1 0 01-.36-1.12l2.8-2.03c.78-.57.38-1.81-.59-1.81h-3.46a1 1 0 01-.95-.69L10 2.93z"
                className="text-amber-400"
              />
            </g>
          ) : (
            // Empty Star
            <path
              fillRule="evenodd"
              d="M12.395 6.679a1 1 0 00-.95-.69h-3.462c-.969 0-1.371 1.24-.588 1.81l2.8 2.034a1 1 0 00.364 1.118l-1.07 3.292c-.3.921.755 1.688 1.54 1.118l2.8-2.034a1 1 0 001.175 0l2.8 2.034c.784.57 1.838-.197 1.539-1.118l-1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              className="text-slate-200 dark:text-slate-800"
              clipRule="evenodd"
            />
          )}
        </svg>
      </span>
    );
  };

  const currentSize = size === 5 ? 'w-5 h-5' : size === 4 ? 'w-4 h-4' : size === 6 ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="flex items-center space-x-1">
      <div className="text-amber-400 flex items-center">
        {stars.map((s) => renderStar(s))}
      </div>
      {text && (
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-1">
          {text}
        </span>
      )}
    </div>
  );
};

export default Rating;
