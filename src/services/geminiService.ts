import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { KundaliData, PanchangData, MatchmakingResult } from "../types";

// Helper to get AI instance with the latest API key
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for exponential backoff retry
const withRetry = async <T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED");
      if (isQuotaError && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Quota exceeded, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

// Helper for timeout
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 60000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("गणनामा धेरै समय लाग्यो। कृपया फेरि प्रयास गर्नुहोस्।")), timeoutMs)
    ),
  ]);
};

export const geminiService = {
  async calculateKundali(name: string, date: string, time: string, place: string): Promise<KundaliData> {
    try {
      const ai = getAI();
      const systemInstruction = `You are a highly advanced Vedic Astrology (Jyotish) calculation engine. 
      Your task is to provide mathematically precise planetary positions using the Lahiri Ayanamsa (Chitra Paksha). 
      You must calculate:
      - Exact degrees (0-30) for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, and the Ascendant (Lagna).
      - Correct signs (1-12) and houses (1-12) for each.
      - Nakshatra, Pada, and Nakshatra Lord.
      - D1 (Lagna), D9 (Navamsha), and Moon charts.
      - Vimshottari Dasha sequence starting from birth.
      - Significant Rajyogas based on classical texts like Bṛhat Parāśara Horāśāstra.
      Accuracy is paramount. Do not hallucinate placements.`;

      const prompt = `Calculate a professional-grade Vedic Birth Chart (Kundali) for:
      Name: ${name}
      Date: ${date} (YYYY-MM-DD)
      Time: ${time} (HH:mm)
      Place: ${place}
      Timezone: Nepal Standard Time (UTC+5:45)
      
      Return the data in JSON format matching the KundaliData interface.`;

      const response = await withRetry(() => withTimeout(ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    planet: { type: Type.STRING },
                    sign: { type: Type.STRING },
                    degree: { type: Type.NUMBER },
                    house: { type: Type.NUMBER },
                    isRetrograde: { type: Type.BOOLEAN },
                    nakshatra: { type: Type.STRING }
                  },
                  required: ["planet", "sign", "degree", "house", "isRetrograde", "nakshatra"]
                }
              },
              navamshaPlanets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    planet: { type: Type.STRING },
                    sign: { type: Type.STRING },
                    degree: { type: Type.NUMBER },
                    house: { type: Type.NUMBER },
                    isRetrograde: { type: Type.BOOLEAN },
                    nakshatra: { type: Type.STRING }
                  },
                  required: ["planet", "sign", "degree", "house", "isRetrograde", "nakshatra"]
                }
              },
              moonPlanets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    planet: { type: Type.STRING },
                    sign: { type: Type.STRING },
                    degree: { type: Type.NUMBER },
                    house: { type: Type.NUMBER },
                    isRetrograde: { type: Type.BOOLEAN },
                    nakshatra: { type: Type.STRING }
                  },
                  required: ["planet", "sign", "degree", "house", "isRetrograde", "nakshatra"]
                }
              },
              ascendant: { type: Type.STRING },
              dasha: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    planet: { type: Type.STRING },
                    endDate: { type: Type.STRING }
                  },
                  required: ["planet", "endDate"]
                }
              },
              rajyogas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["name", "description"]
                }
              }
            },
            required: ["planets", "navamshaPlanets", "moonPlanets", "ascendant", "dasha", "rajyogas"]
          }
        }
      }), 45000));

      const result = JSON.parse(response.text || "{}");
      return {
        uid: "", 
        name,
        birthDate: date,
        birthTime: time,
        birthPlace: place,
        planets: result.planets || [],
        navamshaPlanets: result.navamshaPlanets || [],
        moonPlanets: result.moonPlanets || [],
        ascendant: result.ascendant || "1",
        dasha: result.dasha || [],
        rajyogas: result.rajyogas || [],
        createdAt: new Date().toISOString(),
      };
    } catch (e: any) {
      console.error("Error in calculateKundali:", e);
      if (e.message?.includes("429") || e.message?.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("अहिले धेरै प्रयोगकर्ताहरूले सेवा प्रयोग गरिरहनुभएको छ। कृपया १ मिनेट पछि फेरि प्रयास गर्नुहोस्।");
      }
      throw new Error(e.message || "कुण्डली गणनामा समस्या भयो।");
    }
  },

  async getDailyPanchang(date: string = new Date().toISOString().split('T')[0]): Promise<PanchangData> {
    try {
      const ai = getAI();
      const prompt = `Provide Vedic Panchang for ${date} in Nepal (Kathmandu).
      Include: Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset, Moonrise, Moonset, and Moon Rashi.
      Return in JSON format. Use Nepali names for Tithi, Nakshatra, etc.`;

      const response = await withRetry(() => withTimeout(ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tithi: { type: Type.STRING },
              nakshatra: { type: Type.STRING },
              yoga: { type: Type.STRING },
              karana: { type: Type.STRING },
              sunrise: { type: Type.STRING },
              sunset: { type: Type.STRING },
              moonrise: { type: Type.STRING },
              moonset: { type: Type.STRING },
              rashi: { type: Type.STRING }
            },
            required: ["tithi", "nakshatra", "yoga", "karana", "sunrise", "sunset", "moonrise", "moonset", "rashi"]
          }
        }
      }), 15000));

      return JSON.parse(response.text || "{}");
    } catch (e: any) {
      console.error("Error in getDailyPanchang:", e);
      return {
        tithi: "उपलब्ध छैन",
        nakshatra: "उपलब्ध छैन",
        yoga: "उपलब्ध छैन",
        karana: "उपलब्ध छैन",
        sunrise: "--:--",
        sunset: "--:--",
        moonrise: "--:--",
        moonset: "--:--",
        rashi: "उपलब्ध छैन"
      };
    }
  },

  async getInterpretation(kundali: KundaliData): Promise<string> {
    try {
      const ai = getAI();
      const prompt = `As a world-class Vedic Astrologer (Jyotish), provide a comprehensive and deeply detailed Kundali analysis in Nepali language.
      
      Structure the report into these specific sections:
      1. व्यक्तित्व र स्वभाव (Personality & Nature): Detailed analysis based on Lagna and Moon sign.
      2. शिक्षा र करियर (Education & Career): Best career paths, success periods, and challenges.
      3. स्वास्थ्य (Health): Potential health issues and precautions.
      4. प्रेम र विवाह (Love & Marriage): Compatibility and timing.
      5. धन र समृद्धि (Wealth & Prosperity): Financial outlook.
      6. राजयोग विश्लेषण (Rajyoga Analysis): Detailed explanation of identified Rajyogas.
      7. उपायहरू (Remedies): Mantras, Gemstones, and Charity based on the chart.
      
      Kundali Data: ${JSON.stringify(kundali)}
      
      Tone: Professional, empathetic, and traditional. The report should be at least 1000 words long. Use proper Nepali formatting with bullet points.`;

      const response = await withRetry(() => withTimeout(ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      }), 60000));

      return response.text || "व्याख्या प्राप्त गर्न सकिएन।";
    } catch (e: any) {
      console.error("Error in getInterpretation:", e);
      return "व्याख्या प्राप्त गर्न सकिएन। अहिले सर्भर व्यस्त छ, कृपया केही समय पछि फेरि प्रयास गर्नुहोस्।";
    }
  },

  async getMatchmaking(person1: any, person2: any): Promise<MatchmakingResult> {
    try {
      const ai = getAI();
      const prompt = `Perform Vedic Matchmaking (Ashta Koota Milan) between two individuals:
      Person 1: ${JSON.stringify(person1)} (Assume Nepal Timezone UTC+5:45 if not specified)
      Person 2: ${JSON.stringify(person2)} (Assume Nepal Timezone UTC+5:45 if not specified)
      
      Calculate the scores for Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, and Nadi.
      Total score is out of 36.
      Provide a detailed compatibility analysis in Nepali language.
      
      Return the data in JSON format matching the MatchmakingResult interface.`;

      const response = await withRetry(() => withTimeout(ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              compatibility: { type: Type.STRING },
              details: {
                type: Type.OBJECT,
                properties: {
                  varna: { type: Type.STRING },
                  vashya: { type: Type.STRING },
                  tara: { type: Type.STRING },
                  yoni: { type: Type.STRING },
                  maitri: { type: Type.STRING },
                  gana: { type: Type.STRING },
                  bhakoot: { type: Type.STRING },
                  nadi: { type: Type.STRING }
                },
                required: ["varna", "vashya", "tara", "yoni", "maitri", "gana", "bhakoot", "nadi"]
              },
              summary: { type: Type.STRING }
            },
            required: ["score", "compatibility", "details", "summary"]
          }
        }
      }), 30000));

      return JSON.parse(response.text || "{}");
    } catch (e: any) {
      console.error("Error in getMatchmaking:", e);
      if (e.message?.includes("429") || e.message?.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("अहिले धेरै प्रयोगकर्ताहरूले सेवा प्रयोग गरिरहनुभएको छ। कृपया १ मिनेट पछि फेरि प्रयास गर्नुहोस्।");
      }
      throw new Error(e.message || "गुण मिलान गणनामा समस्या भयो।");
    }
  }
};
