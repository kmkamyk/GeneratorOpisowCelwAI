import { GoogleGenAI, Type } from "@google/genai";
import { ResultItem } from '../types';

export const generateDescriptionsForGoals = async (
  goals: string[],
  tasks: string,
  style: string
): Promise<Omit<ResultItem, 'id' | 'isRefining'>[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      description: {
        type: Type.STRING,
        description: "Wygenerowany, szczegółowy opis celu zawodowego.",
      },
      relevantTasks: {
        type: Type.ARRAY,
        description: "Lista zadań z Jiry, które zostały użyte do stworzenia opisu.",
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["description", "relevantTasks"],
  };
  
  const styleInstruction = style !== 'Domyślny' 
    ? `Ważne: Opis musi być napisany w stylu: "${style}".`
    : '';

  const promises = goals.map(async (goal): Promise<Omit<ResultItem, 'id' | 'isRefining'>> => {
    const prompt = `
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

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const responseText = response.text.trim();
      const parsedJson = JSON.parse(responseText);
      
      return {
        goal,
        description: parsedJson.description || "Nie udało się wygenerować opisu.",
        usedTasks: parsedJson.relevantTasks || [],
      };
    } catch (error) {
      console.error(`Error generating description for goal "${goal}":`, error);
      return {
        goal,
        description: "Wystąpił błąd podczas generowania opisu dla tego celu. Sprawdź konsolę, aby uzyskać więcej informacji.",
        usedTasks: [],
      };
    }
  });

  return Promise.all(promises);
};


export const refineDescription = async (
  description: string,
  action: 'shorten' | 'expand' | 'make_formal'
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  
  const prompt = `
    Twoim zadaniem jest edycja tekstu zgodnie z podanym poleceniem. Zwróć tylko i wyłącznie zmodyfikowany tekst, bez żadnych dodatkowych komentarzy, wstępów czy znaczników.

    Polecenie: ${actionInstruction}

    Oryginalny tekst do modyfikacji:
    ---
    ${description}
    ---

    Zmodyfikowany tekst:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error(`Error refining description for action "${action}":`, error);
    throw new Error("Wystąpił błąd podczas modyfikacji opisu.");
  }
};