export interface ResultItem {
  id: string;
  goal: string;
  description: string;
  usedTasks: string[];
  isRefining?: boolean;
}

export type ApiProvider = 'gemini' | 'local';
export type LocalProvider = 'ollama' | 'llama.cpp';

export interface LocalLlmConfig {
  provider: LocalProvider;
  apiAddress: string;
  modelName: string;
}
