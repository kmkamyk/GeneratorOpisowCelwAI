import React, { useState } from 'react';
import { ResultItem } from '../types';

interface ResultCardProps {
  item: ResultItem;
  animationDelay: string;
  onRefine: (action: 'shorten' | 'expand' | 'make_formal') => void;
}

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ShortenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);
const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
  </svg>
);
const FormalIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 3a3 3 0 013-3h6a3 3 0 013 3v2h-2V3a1 1 0 00-1-1H9a1 1 0 00-1 1v2H6V3zM4 7a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm2 2v6h12V9H6z" clipRule="evenodd" />
  </svg>
);

const RefiningSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const ResultCard: React.FC<ResultCardProps> = ({ item, animationDelay, onRefine }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isTasksVisible, setIsTasksVisible] = useState(false);

  const handleCopy = () => {
    if (item.description) {
      navigator.clipboard.writeText(item.description);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const description = item.description || "";
  const usedTasks = item.usedTasks || [];

  return (
    <div 
      className="glow-container animate-fadeInUp"
      style={{ animationDelay: animationDelay }}
    >
      <header className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
        <h3 className="text-lg font-bold text-slate-800 break-all">
          {item.goal}
        </h3>
        <button
          onClick={handleCopy}
          title="Kopiuj opis"
          className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-sky-600 transition-colors duration-200"
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </header>

      <div className="p-6 relative">
        {item.isRefining && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-b-2xl z-10">
            <RefiningSpinner />
          </div>
        )}
        <div className={`prose prose-slate max-w-none text-slate-600 transition-opacity duration-300 ${item.isRefining ? 'opacity-30' : 'opacity-100'}`}>
          {description.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
      
      <footer className="px-6 pb-6 pt-2">
        <details className="group" onToggle={(e) => setIsTasksVisible((e.target as HTMLDetailsElement).open)}>
           <summary className="list-none flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <span>Użyte zadania ({usedTasks.length})</span>
             <svg className={`h-5 w-5 transition-transform duration-200 ${isTasksVisible ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
             </svg>
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 pl-4 list-disc list-outside">
            {usedTasks.length > 0 ? (
                usedTasks.map((task, index) => (
                    <li key={index} className="break-words">{task}</li>
                ))
            ) : (
                <li>Brak powiązanych zadań.</li>
            )}
          </ul>
        </details>
        
        <div className="border-t border-slate-200 mt-6 pt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">Ulepsz opis:</span>
          <button onClick={() => onRefine('shorten')} className="action-btn" disabled={item.isRefining}><ShortenIcon /> Skróć</button>
          <button onClick={() => onRefine('expand')} className="action-btn" disabled={item.isRefining}><ExpandIcon /> Rozwiń</button>
          <button onClick={() => onRefine('make_formal')} className="action-btn" disabled={item.isRefining}><FormalIcon /> Bardziej formalny</button>
        </div>
      </footer>
    </div>
  );
};

export default ResultCard;
