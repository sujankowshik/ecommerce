import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`bg-slate-200 dark:bg-slate-800 rounded-xl skeleton-pulse ${className}`}></div>
  );
};

// Reusable preset card grid loader
export const ProductCardSkeleton = () => {
  return (
    <div className="premium-card p-4 flex flex-col space-y-4">
      {/* Image Area */}
      <Skeleton className="aspect-square w-full rounded-2xl" />
      
      {/* Title block */}
      <Skeleton className="h-6 w-3/4" />
      
      {/* Description block */}
      <Skeleton className="h-4 w-5/6" />
      
      {/* Pricing/Rating details row */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-6">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
        </td>
      ))}
    </tr>
  );
};
