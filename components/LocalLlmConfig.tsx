import React from 'react';
import { ApiProvider, LocalLlmConfig } from '../types';

interface LocalLlmConfigProps {
  apiProvider: ApiProvider;
  setApiProvider: (provider: ApiProvider) => void;
  config: LocalLlmConfig;
  setConfig: (config: LocalLlmConfig) => void;
}

const ArrowIcon = () => (
  <svg className="h-5 w-5 text-slate-400 arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);


const LocalLlmConfigComponent: React.FC<LocalLlmConfigProps> = ({ apiProvider, setApiProvider, config, setConfig }) => {

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const placeholder = config.provider === 'ollama' ? 'http://localhost:11434' : 'http://localhost:8080';

  return (
    <div className="border-t border-slate-200 pt-6">
      <details>
        <summary className="flex justify-between items-center cursor-pointer">
          <h3 className="text-md font-semibold text-slate-700">Konfiguracja Zaawansowana</h3>
          <ArrowIcon />
        </summary>
        
        <div className="mt-6 space-y-6">
          {/* API Provider Switch */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Źródło AI</label>
            <div className="flex rounded-md bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setApiProvider('gemini')}
                className={`w-full py-1.5 text-sm font-semibold rounded ${apiProvider === 'gemini' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-200'} transition-all`}
              >
                Google Gemini
              </button>
              <button
                onClick={() => setApiProvider('local')}
                className={`w-full py-1.5 text-sm font-semibold rounded ${apiProvider === 'local' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-200'} transition-all`}
              >
                Lokalny LLM
              </button>
            </div>
          </div>
          
          {/* Local LLM Configuration */}
          {apiProvider === 'local' && (
            <div className="space-y-4 p-4 border border-slate-200 bg-white/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Local Provider */}
                    <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-slate-600 mb-2">Dostawca</label>
                        <select
                        id="provider"
                        name="provider"
                        value={config.provider}
                        onChange={handleConfigChange}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all duration-300"
                        >
                        <option value="ollama">Ollama</option>
                        <option value="llama.cpp">Llama.cpp</option>
                        </select>
                    </div>

                    {/* Model Name */}
                    <div>
                        <label htmlFor="modelName" className="block text-sm font-medium text-slate-600 mb-2">Nazwa Modelu</label>
                        <input
                        type="text"
                        id="modelName"
                        name="modelName"
                        value={config.modelName}
                        onChange={handleConfigChange}
                        placeholder="np. llama3, mistral"
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all duration-300"
                        />
                    </div>
                </div>

              {/* API Address */}
              <div>
                <label htmlFor="apiAddress" className="block text-sm font-medium text-slate-600 mb-2">Adres API</label>
                <input
                  type="text"
                  id="apiAddress"
                  name="apiAddress"
                  value={config.apiAddress}
                  onChange={handleConfigChange}
                  placeholder={placeholder}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all duration-300"
                />
                 {config.provider === 'llama.cpp' && (
                  <p className="text-xs text-slate-500 mt-1 italic">
                    Podaj bazowy adres serwera. Aplikacja automatycznie użyje endpointu <code>/completion</code>.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </details>
    </div>
  );
};

export default LocalLlmConfigComponent;