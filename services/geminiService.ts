import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TermInput, PuzzleData } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PUZZLE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    theme: { type: Type.STRING, description: "Het overkoepelende thema van de puzzel." },
    groups: {
      type: Type.ARRAY,
      description: "Een lijst van precies 4 groepen (antwoorden).",
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: "Het antwoord/begrip." },
          clues: {
            type: Type.ARRAY,
            description: "Precies 3 cryptische omschrijvingen, associaties of synoniemen voor dit begrip.",
            items: { type: Type.STRING }
          }
        },
        required: ["term", "clues"]
      }
    }
  },
  required: ["theme", "groups"]
};

export const generatePuzzleData = async (
  themeInput: string,
  termsInput: TermInput[]
): Promise<PuzzleData> => {
  const model = "gemini-2.5-flash";

  // Construct a prompt that includes user provided data
  const termsDescription = termsInput
    .map((t, index) => {
      const clues = t.userClues.filter(c => c.trim() !== "").join(", ");
      return `Begrip ${index + 1}: "${t.term}"${clues ? ` (Gebruikers suggesties voor omschrijvingen: ${clues})` : ""}`;
    })
    .join("\n");

  const prompt = `
    Je bent de redacteur van de "Puzzelronde" van het programma "De Slimste Mens".
    
    Maak een puzzelronde op basis van de volgende input.
    Thema: ${themeInput || "Kies een passend thema bij de begrippen"}
    
    De input bevat 4 begrippen. Voor elk begrip heb ik PRECIES 3 korte, pakkende trefwoorden/omschrijvingen nodig.
    
    Instructies:
    1. Gebruik de opgegeven begrippen.
    2. Als er gebruikerssuggesties zijn voor omschrijvingen, gebruik deze of verbeter ze zodat ze kort en krachtig zijn.
    3. Als er geen suggesties zijn, bedenk zelf slimme, creatieve en korte associaties (1-3 woorden per omschrijving).
    4. Het totaal moet bestaan uit 4 begrippen met elk 3 omschrijvingen.
    5. De taal moet Nederlands zijn.
    
    Input Begrippen:
    ${termsDescription}
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PUZZLE_SCHEMA,
        systemInstruction: "Je bent een expert in het maken van woordpuzzels voor De Slimste Mens. Je output is altijd valide JSON.",
      },
    });

    const data = JSON.parse(response.text || "{}");
    
    // Transform API response to internal format with IDs
    return {
      theme: data.theme,
      groups: data.groups.map((g: any, index: number) => ({
        id: `group-${index}`,
        term: g.term,
        clues: g.clues.slice(0, 3) // Ensure max 3
      }))
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Kon de puzzel niet genereren. Probeer het opnieuw.");
  }
};