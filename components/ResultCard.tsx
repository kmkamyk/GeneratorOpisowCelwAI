import React, { useState } from 'react';
import { ResultItem } from '../types';
import { GradientIcon } from './GradientIcon';

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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.342.639l.25 1.5a1 1 0 001.954-.325L7.38 8.751a1 1 0 01.658-.642l4.3-1.631a1 1 0 00.658.642l.399.151a1 1 0 00.975-.325l.25-1.5a.999.999 0 01.342-.639l1.856-.88a1 1 0 000-1.84l-7-3zM10 18a1 1 0 001-1v-6a1 1 0 10-2 0v6a1 1 0 001 1z" />
  </svg>
);
const ActionButtonLoader = () => (
  <svg className="animate-spin h-5 w-5 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const ResultCard: React.FC<ResultCardProps> = ({ item, animationDelay, onRefine }) => {
  const [isAllCopied, setIsAllCopied] = useState(false);
  const [isDescriptionCopied, setIsDescriptionCopied] = useState(false);
  const paragraphs = item.description.split('\n').filter(p => p.trim() !== '');

  const handleCopyAll = () => {
    const textToCopy = `Cel: ${item.goal}\n\nOpis:\n${item.description}\n\nPowiązane zadania:\n- ${item.usedTasks.join('\n- ')}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsAllCopied(true);
      setTimeout(() => setIsAllCopied(false), 2500);
    });
  };

  const handleCopyDescription = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.description).then(() => {
      setIsDescriptionCopied(true);
      setTimeout(() => setIsDescriptionCopied(false), 2500);
    });
  };

  return (
    <div
      className="glow-container transition-all duration-300 hover:-translate-y-2 animate-fadeInUp"
      style={{ animationDelay }}
    >
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-blue-400 pr-4">{item.goal}</h3>
          <button
            onClick={handleCopyAll}
            className="p-2 rounded-full bg-slate-800/70 hover:bg-sky-500/30 text-slate-400 hover:text-sky-300 transition-all duration-300 flex-shrink-0"
            aria-label="Kopiuj wszystko"
            title={isAllCopied ? "Skopiowano!" : "Kopiuje cel, opis i zadania"}
          >
            {isAllCopied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
        
        <div className="border-t border-slate-800 pt-4">
            <div className="flex justify-between items-center mb-4">
                 <h4 className="text-md font-semibold text-slate-400">Opis:</h4>
                 <button
                    onClick={handleCopyDescription}
                    className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-sky-300 transition-colors duration-300"
                    title={isDescriptionCopied ? "Skopiowano!" : "Kopiuj tylko opis"}
                 >
                    {isDescriptionCopied ? (
                        <>
                        <CheckIcon />
                        <span>Skopiowano</span>
                        </>
                    ) : (
                        <>
                        <CopyIcon />
                        <span>Kopiuj</span>
                        </>
                    )}
                 </button>
            </div>
          <div className="space-y-4 text-slate-300 text-base leading-relaxed">
            {paragraphs.map((para, index) => (
              <p key={index}>{para}</p>
            ))}
          </div>
        </div>

        {item.usedTasks && item.usedTasks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-md font-semibold text-slate-400 mb-3">Powiązane zadania:</h4>
            <ul className="space-y-2.5">
              {item.usedTasks.map((task, index) => (
                <li key={index} className="flex items-start text-sm text-slate-400">
                   <GradientIcon>
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </GradientIcon>
                  <span className="ml-3">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-4">
          <h4 className="text-md font-semibold text-slate-400 flex-shrink-0">Działania AI:</h4>
          {item.isRefining ? (
             <div className="flex items-center gap-2 text-slate-400">
                <ActionButtonLoader />
                <span>Przetwarzanie...</span>
             </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => onRefine('shorten')} className="action-btn" title="Skróć opis">
                 <ShortenIcon /> Skróć
              </button>
              <button onClick={() => onRefine('expand')} className="action-btn" title="Rozwiń opis">
                <ExpandIcon /> Rozwiń
              </button>
              <button onClick={() => onRefine('make_formal')} className="action-btn" title="Zmień ton na bardziej formalny">
                 <FormalIcon /> Zmień ton
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;