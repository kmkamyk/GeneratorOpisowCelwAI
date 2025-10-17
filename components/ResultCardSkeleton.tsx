import React from 'react';

interface ResultCardSkeletonProps {
  goal: string;
  animationDelay: string;
}

const ResultCardSkeleton: React.FC<ResultCardSkeletonProps> = ({ goal, animationDelay }) => {
  return (
    <div 
      className="glow-container animate-fadeInUp"
      style={{ animationDelay: animationDelay }}
    >
      <header className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
        <h3 className="text-lg font-bold text-slate-500 break-all">
          {goal}
        </h3>
        <div className="p-2 h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
      </header>

      <div className="p-6 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
      </div>
      
      <footer className="px-6 pb-6 pt-2">
         <div className="h-5 bg-slate-200 rounded w-1/3 animate-pulse"></div>
         <div className="border-t border-slate-200 mt-6 pt-4 flex flex-wrap items-center gap-3">
            <div className="h-5 w-24 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-9 w-36 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </footer>
    </div>
  );
};

export default ResultCardSkeleton;
