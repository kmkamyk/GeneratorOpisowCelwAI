import React, { useState, useCallback, useEffect } from 'react';
import { generateDescriptionForSingleGoal } from './services/geminiService';
import { refineDescription } from './services/geminiService';
import { generateDescriptionForSingleGoalLocal, refineDescriptionLocal } from './services/localLlmService';
import { ResultItem, ApiProvider, LocalLlmConfig, LocalProvider } from './types';
import Header from './components/Header';
import TextAreaInput from './components/TextAreaInput';
import ResultCard from './components/ResultCard';
import ResultCardSkeleton from './components/ResultCardSkeleton';
import EmptyState from './components/EmptyState';
import StyleSelector from './components/StyleSelector';
import LocalLlmConfigComponent from './components/LocalLlmConfig';

const GoalsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 3c1.398 0 2.743.57 3.714 1.543C18.5 6.5 19 9 19 10c2 1 2.657 1.657 2.657 1.657a8 8 0 01-4.001 7z" />
  </svg>
);

const TasksIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const App: React.FC = () => {
  const [goals, setGoals] = useState(() => localStorage.getItem('savedGoals') || '');
  const [tasks, setTasks] = useState(() => localStorage.getItem('savedTasks') || '');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState('Domyślny');
  
  const [apiProvider, setApiProvider] = useState<ApiProvider>('gemini');
  const [localLlmConfig, setLocalLlmConfig] = useState<LocalLlmConfig>({
    provider: 'ollama',
    apiAddress: 'http://localhost:11434',
    modelName: 'llama3'
  });

  // Save goals and tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedGoals', goals);
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('savedTasks', tasks);
  }, [tasks]);


  useEffect(() => {
    setLocalLlmConfig(prev => ({
      ...prev,
      apiAddress: prev.provider === 'ollama' ? 'http://localhost:11434' : 'http://localhost:8080'
    }));
  }, [localLlmConfig.provider]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }
    button.appendChild(circle);
  };

  const handleGenerate = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!goals.trim() || !tasks.trim()) return;
    createRipple(event);
    setIsLoading(true);
    setError(null);

    const goalsArray = goals.split('\n').filter(g => g.trim() !== '');

    const skeletonResults: ResultItem[] = goalsArray.map(goal => ({
      id: crypto.randomUUID(),
      goal,
      status: 'loading',
    }));
    setResults(skeletonResults);

    try {
        for (const skeleton of skeletonResults) {
            let generatedData;
             if (apiProvider === 'gemini') {
                generatedData = await generateDescriptionForSingleGoal(skeleton.goal, tasks, style);
            } else {
                generatedData = await generateDescriptionForSingleGoalLocal(skeleton.goal, tasks, style, localLlmConfig);
            }

            setResults(prevResults => 
                prevResults.map(res => 
                    res.id === skeleton.id 
                    ? { ...res, ...generatedData, status: 'completed' } 
                    : res
                )
            );
        }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd.";
      setError(`Błąd API: ${errorMessage}`);
      console.error(err);
      setResults([]); // Clear skeletons on error
    } finally {
      setIsLoading(false);
    }
  }, [goals, tasks, style, apiProvider, localLlmConfig]);

  const handleRefine = useCallback(async (id: string, action: 'shorten' | 'expand' | 'make_formal') => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, isRefining: true } : r));
    
    const currentItem = results.find(r => r.id === id);
    if (!currentItem || !currentItem.description) return;

    try {
      let newDescription;
      if (apiProvider === 'gemini') {
        newDescription = await refineDescription(currentItem.description, action);
      } else {
        newDescription = await refineDescriptionLocal(currentItem.description, action, localLlmConfig);
      }
      setResults(prev => prev.map(r => r.id === id ? { ...r, description: newDescription, isRefining: false } : r));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd.";
      setError(`Błąd modyfikacji: ${errorMessage}`);
      setResults(prev => prev.map(r => r.id === id ? { ...r, isRefining: false } : r));
    }
  }, [results, apiProvider, localLlmConfig]);

  const handleClearAll = () => {
    setResults([]);
    setGoals('');
    setTasks('');
  };
  
  const isLocalConfigInvalid = apiProvider === 'local' && (!localLlmConfig.apiAddress.trim() || !localLlmConfig.modelName.trim());
  const isButtonDisabled = isLoading || !goals.trim() || !tasks.trim() || isLocalConfigInvalid;
  
  const mainInputContainerClasses = `
    glow-container
    transition-all duration-500
    p-2 sm:p-4
  `;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto">
        <Header />

        <main className="mt-8">
          <div className={mainInputContainerClasses}>
            <div className="flex flex-col gap-8">
              <TextAreaInput
                id="goals-input"
                label="Cele (jeden w każdej linii)"
                placeholder="np. Wdrożenie nowego modułu płatności"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                icon={<GoalsIcon />}
              />
              <TextAreaInput
                id="tasks-input"
                label="Wykonane zadania z Jiry (wklej listę)"
                placeholder="np. PROJ-123: Analiza wymagań API dostawcy płatności..."
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                icon={<TasksIcon />}
              />
            </div>
             <div className="mt-6 px-4 space-y-6">
              <StyleSelector value={style} onChange={setStyle} />
              <LocalLlmConfigComponent
                apiProvider={apiProvider}
                setApiProvider={setApiProvider}
                config={localLlmConfig}
                setConfig={setLocalLlmConfig}
              />
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={handleGenerate}
                disabled={isButtonDisabled}
                title={isButtonDisabled ? "Wypełnij wszystkie pola, aby kontynuować" : "Generuj opisy"}
                className="ripple-btn inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-sky-400/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <GenerateIcon />
                {isLoading ? 'Generowanie...' : 'Generuj Opisy'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-8 text-center bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg animate-fadeInUp">
              <p>{error}</p>
            </div>
          )}

          <div className="mt-12">
            {results.length > 0 && (
              <div className="space-y-8">
                 {!isLoading && (
                    <div className="flex justify-between items-center mb-6 animate-fadeInUp">
                        <h2 className="text-3xl font-bold text-slate-800">Wygenerowane Opisy</h2>
                        <button 
                            onClick={handleClearAll}
                            className="px-4 py-2 text-sm bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg transition-all duration-300"
                            title="Wyczyść wygenerowane opisy oraz wprowadzone dane"
                        >
                            Wyczyść wszystko
                        </button>
                    </div>
                 )}
                {results.map((item, index) =>
                  item.status === 'loading' ? (
                    <ResultCardSkeleton 
                        key={item.id} 
                        goal={item.goal} 
                        animationDelay={`${index * 100}ms`} 
                    />
                  ) : (
                    <ResultCard 
                      key={item.id} 
                      item={item} 
                      animationDelay={'0ms'} 
                      onRefine={(action) => handleRefine(item.id, action)}
                    />
                  )
                )}
              </div>
            )}
             {!isLoading && !error && results.length === 0 && <EmptyState />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;