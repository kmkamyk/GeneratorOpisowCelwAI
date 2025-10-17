import { ResultItem, LocalLlmConfig } from '../types';

// Instrukcja dotycząca schematu JSON pozostaje przydatna dla modeli, które nie obsługują w pełni trybu JSON.
const JSON_SCHEMA_INSTRUCTION = `
Zwróć wynik w formacie JSON. Klucz 'relevantTasks' powinien zawierać listę pełnych nazw zadań (np. "PROJ-123: Analiza wymagań"), które wybrałeś. Wygeneruj wyłącznie obiekt JSON.
`;

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
    3.  ${JSON_SCHEMA_INSTRUCTION}
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

// Ten pomocnik jest inspirowany kodem dostarczonym przez użytkownika, używając nowoczesnych punktów końcowych uzupełniania czatu.
async function executeLocalApiCall(url: string, body: object, provider: 'ollama' | 'llama.cpp') {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Błąd serwera (${response.status}) dla ${provider}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) { // Błąd sieciowy
      throw new Error(`Nie udało się połączyć z serwerem ${provider} pod adresem: ${url}. Upewnij się, że serwer jest uruchomiony i adres jest poprawny.`);
    }
    throw error; // Ponowne rzucenie innych błędów
  }
}

// Funkcja do bezpiecznego parsowania potencjalnie źle sformatowanych ciągów JSON z LLM
function safeJsonParse(jsonString: string): any {
    try {
        // Próba znalezienia początku obiektu lub tablicy JSON
        const startIndex = jsonString.indexOf('{');
        const startBracket = jsonString.indexOf('[');
        
        let actualStartIndex = -1;

        if (startIndex > -1 && startBracket > -1) {
            actualStartIndex = Math.min(startIndex, startBracket);
        } else if (startIndex > -1) {
            actualStartIndex = startIndex;
        } else {
            actualStartIndex = startBracket;
        }

        if (actualStartIndex === -1) {
            throw new Error("Nie znaleziono obiektu ani tablicy JSON w ciągu znaków.");
        }

        const trimmedString = jsonString.substring(actualStartIndex);
        return JSON.parse(trimmedString);
    } catch (e) {
        console.error("Nie udało się sparsować odpowiedzi LLM jako JSON:", e);
        console.error("Oryginalny ciąg znaków:", jsonString);
        throw new Error("Odpowiedź AI nie jest prawidłowym formatem JSON.");
    }
}

export const generateDescriptionForSingleGoalLocal = async (
  goal: string,
  tasks: string,
  style: string,
  config: LocalLlmConfig
): Promise<Omit<ResultItem, 'id' | 'isRefining' | 'status'>> => {
  const prompt = buildGenerationPrompt(goal, tasks, style);
  let requestBody;
  let apiUrl;

  try {
    if (config.provider === 'ollama') {
        apiUrl = new URL('/api/chat', config.apiAddress).toString();
        requestBody = {
            model: config.modelName,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            format: 'json',
        };
        const data = await executeLocalApiCall(apiUrl, requestBody, 'ollama');
        const parsedJson = safeJsonParse(data.message.content);
        
        return {
            goal,
            description: parsedJson.description || "Nie udało się wygenerować opisu.",
            usedTasks: parsedJson.relevantTasks || [],
        };
    } else { // llama.cpp (zakładając API zgodne z OpenAI)
        apiUrl = new URL('/v1/chat/completions', config.apiAddress).toString();
        requestBody = {
            model: config.modelName,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            response_format: { type: "json_object" },
            temperature: 0.2, // Niższa temperatura dla bardziej przewidywalnego wyniku JSON
        };
        const data = await executeLocalApiCall(apiUrl, requestBody, 'llama.cpp');
        const parsedJson = safeJsonParse(data.choices[0].message.content);

        return {
            goal,
            description: parsedJson.description || "Nie udało się wygenerować opisu.",
            usedTasks: parsedJson.relevantTasks || [],
        };
    }
  } catch (error) {
    console.error(`Błąd podczas generowania opisu dla celu "${goal}" z ${config.provider}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
    return {
      goal,
      description: `Wystąpił błąd podczas generowania opisu: ${errorMessage}`,
      usedTasks: [],
    };
  }
};

export const refineDescriptionLocal = async (
  description: string,
  action: 'shorten' | 'expand' | 'make_formal',
  config: LocalLlmConfig
): Promise<string> => {
  const prompt = buildRefinePrompt(description, action);
  let requestBody;
  let apiUrl;

  try {
     if (config.provider === 'ollama') {
        apiUrl = new URL('/api/chat', config.apiAddress).toString();
        requestBody = {
            model: config.modelName,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
        };
        const data = await executeLocalApiCall(apiUrl, requestBody, 'ollama');
        return data.message.content.trim();
    } else { // llama.cpp
        apiUrl = new URL('/v1/chat/completions', config.apiAddress).toString();
        requestBody = {
            model: config.modelName,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            temperature: 0.7,
        };
        const data = await executeLocalApiCall(apiUrl, requestBody, 'llama.cpp');
        return data.choices[0].message.content.trim();
    }
  } catch (error) {
     console.error(`Błąd podczas modyfikacji opisu z ${config.provider}:`, error);
     if (error instanceof Error) {
        throw error;
     }
     throw new Error("Wystąpił nieznany błąd podczas modyfikacji opisu.");
  }
};
