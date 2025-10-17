import { ResultItem, LocalLlmConfig } from '../types';

const JSON_SCHEMA = {
  "type": "object",
  "properties": {
    "description": {
      "type": "string",
      "description": "Wygenerowany, szczegółowy opis celu zawodowego."
    },
    "relevantTasks": {
      "type": "array",
      "description": "Lista zadań z Jiry, które zostały użyte do stworzenia opisu.",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["description", "relevantTasks"]
};

const buildGenerationPrompt = (goal: string, tasks: string, style: string): string => {
  const styleInstruction = style !== 'Domyślny' 
    ? `Ważne: Opis musi być napisany w stylu: "${style}".`
    : '';

  return `
    Jesteś ekspertem w formułowaniu opisów osiągnięć zawodowych. Twoim zadaniem jest zidentyfikowanie zadań z podanej listy, które są bezpośrednio powiązane z podanym celem, a następnie stworzenie na ich podstawie rozbudowanego opisu celu.

    ${styleInstruction}

    Analizowany Cel:
    "${goal}"

    Pełna lista wykonanych zadań (kontekst):
    ---
    ${tasks}
    ---

    Twoje zadania:
    1.  Dokładnie przeanalizuj listę zadań i zidentyfikuj te, które przyczyniły się do realizacji celu "${goal}".
    2.  Na podstawie wybranych zadań, napisz profesjonalny, szczegółowy opis celu (dwa do trzech akapitów), podkreślając wkład tych zadań i osiągnięte rezultaty.
    3.  Zwróć wynik w formacie JSON, używając zdefiniowanego schematu. Klucz 'relevantTasks' powinien zawierać listę pełnych nazw zadań (np. "PROJ-123: Analiza wymagań"), które wybrałeś.

    Wygeneruj wyłącznie obiekt JSON.
  `;
};

const buildRefinePrompt = (description: string, action: 'shorten' | 'expand' | 'make_formal'): string => {
   let actionInstruction = '';
  switch(action) {
    case 'shorten':
      actionInstruction = "Skróć poniższy tekst, zachowując jego kluczowe znaczenie i profesjonalny ton. Skup się na zwięzłości i najważniejszych informacjach.";
      break;
    case 'expand':
      actionInstruction = "Rozwiń poniższy tekst. Dodaj więcej szczegółów, podaj konkretne przykłady lub rozbuduj istniejące myśli, aby opis był bardziej wyczerpujący. Zachowaj profesjonalny ton.";
      break;
    case 'make_formal':
      actionInstruction = "Przepisz poniższy tekst, nadając mu bardziej formalny i korporacyjny ton. Unikaj kolokwializmów i używaj profesjonalnego słownictwa.";
      break;
  }
  
  return `
    Twoim zadaniem jest edycja tekstu zgodnie z podanym poleceniem. Zwróć tylko i wyłącznie zmodyfikowany tekst, bez żadnych dodatkowych komentarzy, wstępów czy znaczników.

    Polecenie: ${actionInstruction}

    Oryginalny tekst do modyfikacji:
    ---
    ${description}
    ---

    Zmodyfikowany tekst:
  `;
};

async function executeLocalApiCall(url: string, body: object) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Błąd serwera (${response.status}): ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) { // Network error
      throw new Error(`Nie udało się połączyć z serwerem pod adresem: ${url}. Upewnij się, że serwer jest uruchomiony i adres jest poprawny.`);
    }
    throw error; // Re-throw other errors
  }
}

export const generateDescriptionsForGoalsLocal = async (
  goals: string[],
  tasks: string,
  style: string,
  config: LocalLlmConfig
): Promise<Omit<ResultItem, 'id' | 'isRefining'>[]> => {
  const promises = goals.map(async (goal): Promise<Omit<ResultItem, 'id' | 'isRefining'>> => {
    const prompt = buildGenerationPrompt(goal, tasks, style);
    let requestBody;
    let apiUrl;

    if (config.provider === 'ollama') {
      apiUrl = new URL('/api/generate', config.apiAddress).toString();
      requestBody = {
        model: config.modelName,
        prompt: prompt,
        stream: false,
        format: 'json',
      };
    } else { // llama.cpp
      apiUrl = new URL('/completion', config.apiAddress).toString();
      requestBody = {
        prompt: prompt.replace("Wygeneruj wyłącznie obiekt JSON.", ""), // Llama.cpp uses schema, so instruction is redundant
        n_predict: 1024,
        json_schema: JSON_SCHEMA,
      };
    }

    try {
      const data = await executeLocalApiCall(apiUrl, requestBody);
      
      let parsedJson;
      if (config.provider === 'ollama') {
        parsedJson = JSON.parse(data.response);
      } else { // llama.cpp
        parsedJson = JSON.parse(data.content);
      }
      
      return {
        goal,
        description: parsedJson.description || "Nie udało się wygenerować opisu.",
        usedTasks: parsedJson.relevantTasks || [],
      };
    } catch (error) {
      console.error(`Error generating description for goal "${goal}" with ${config.provider}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      return {
        goal,
        description: `Wystąpił błąd podczas generowania opisu: ${errorMessage}`,
        usedTasks: [],
      };
    }
  });

  return Promise.all(promises);
};

export const refineDescriptionLocal = async (
  description: string,
  action: 'shorten' | 'expand' | 'make_formal',
  config: LocalLlmConfig
): Promise<string> => {
  const prompt = buildRefinePrompt(description, action);
  let requestBody;
  let apiUrl;

  if (config.provider === 'ollama') {
    apiUrl = new URL('/api/generate', config.apiAddress).toString();
    requestBody = {
      model: config.modelName,
      prompt: prompt,
      stream: false,
    };
  } else { // llama.cpp
    apiUrl = new URL('/completion', config.apiAddress).toString();
    requestBody = {
      prompt: prompt,
      n_predict: 512,
    };
  }
  
  try {
    const data = await executeLocalApiCall(apiUrl, requestBody);
    
    if (config.provider === 'ollama') {
      return data.response.trim();
    } else { // llama.cpp
      return data.content.trim();
    }
  } catch (error) {
     console.error(`Error refining description with ${config.provider}:`, error);
     if (error instanceof Error) {
        throw error;
     }
     throw new Error("Wystąpił nieznany błąd podczas modyfikacji opisu.");
  }
};
