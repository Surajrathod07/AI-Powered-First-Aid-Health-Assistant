
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisRequest, ChatSession, StructuredAIResponse, CarePlace, Contact, ReportPayload } from "../types";
import { getHealthContextBlock } from "./profileService";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Generates the medical report based on structured inputs.
 * Returns a ReportPayload JSON object.
 */
export const generateMedicalReport = async (request: AnalysisRequest): Promise<ReportPayload> => {
  const { patientDetails, clinicalContext, imageFile } = request;
  
  // Inject Profile Context
  const healthContext = await getHealthContextBlock();

  const prompt = `
  ${healthContext}

  You are a CALM, EXPERIENCED, and PRACTICAL medical support assistant.
  Your task is to generate a professional medical summary for a patient.

  --- PATIENT DETAILS ---
  • Name: ${patientDetails.name || "Anon"}
  • Age: ${patientDetails.age} (Use this EXACT numeric age)
  • Sex: ${patientDetails.sex}
  • Symptom: ${patientDetails.symptomType}
  • Duration: ${patientDetails.duration}
  • Pain: ${patientDetails.painSeverity}

  --- CLINICAL CONTEXT ---
  ${clinicalContext || "None"}

  --- TASK ---
  Generate a JSON report following the strict schema.

  --- SAFETY & TONE RULES (CRITICAL) ---
  1. **Tone**: Calm, reassuring, and professional. Like a kind family doctor explaining things to a patient.
  2. **Panic Control**: 
     - Never use alarmist language (e.g., "deadly", "fatal", "immediate danger").
     - Even for serious symptoms, say: "These symptoms require professional medical attention."
  3. **Causes**: List common, non-serious causes first. 
  4. **Medicines**:
     - Suggest OTC (Over-The-Counter) medicines ONLY.
     - Include Name, Dosage, Frequency, and Timing (e.g. "After food").
     - IF RISK LEVEL IS 'EMERGENCY', DO NOT SUGGEST ANY MEDICINES.
  5. **When to See Doctor**:
     - Provide clear, calm red flags. "If X happens, please see a doctor."
  `;

  // Define strict schema for ReportPayload
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      reportId: { type: Type.STRING },
      generatedAt: { type: Type.STRING },
      patient: {
        type: Type.OBJECT,
        properties: {
           name: { type: Type.STRING },
           ageYears: { type: Type.NUMBER },
           sex: { type: Type.STRING }
        },
        required: ["ageYears"]
      },
      riskLevel: { type: Type.STRING, enum: ["low", "moderate", "emergency"] },
      clinicalSummary: { type: Type.STRING, description: "Section 2: Reported Symptoms & Summary" },
      possibleCauses: {
          type: Type.ARRAY,
          items: {
              type: Type.OBJECT,
              properties: {
                  name: { type: Type.STRING },
                  confidence: { type: Type.STRING }
              }
          },
          description: "Section 3: Possible Causes (Non-alarming first)"
      },
      suggestedMedicines: {
          type: Type.ARRAY,
          items: {
              type: Type.OBJECT,
              properties: {
                  name: { type: Type.STRING },
                  form: { type: Type.STRING, enum: ["tablet", "syrup", "cream", "ointment"] },
                  strength: { type: Type.STRING },
                  dose: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  timing: { type: Type.STRING },
                  maxDailyDose: { type: Type.STRING },
                  ageLimit: { type: Type.STRING },
                  contraindications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  notes: { type: Type.STRING }
              },
              required: ["name", "form", "dose", "frequency", "timing"]
          },
          description: "Section 4: Suggested Medicines"
      },
      recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Section 5: Home Care & Self-Care" },
      redFlags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Section 6: When to See a Doctor (Calm guidance)" },
      disclaimer: { type: Type.STRING, description: "Section 7: Disclaimer" },
      generatedBy: { type: Type.STRING }
    },
    required: ["riskLevel", "clinicalSummary", "possibleCauses", "recommendedActions", "suggestedMedicines", "redFlags", "disclaimer"]
  };

  try {
    const parts: any[] = [{ text: prompt }];

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.2, 
      }
    });

    if (!response.text) throw new Error("No response text");
    
    const payload = JSON.parse(response.text) as ReportPayload;
    
    // Post-processing fill-ins
    payload.reportId = payload.reportId || `rep-${Date.now()}`;
    payload.generatedAt = new Date().toISOString();
    payload.patient.name = patientDetails.name || "Anon";
    payload.patient.ageYears = patientDetails.age; // Ensure strict numeric age is kept

    // Double check emergency rule
    if (payload.riskLevel === 'emergency') {
        payload.suggestedMedicines = []; // Clear meds
    }

    return payload;

  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate report. Please try again.");
  }
};


/**
 * Chat functionality for the Clinical Assistant module.
 */
export const chatWithMedicalAI = async (
    session: ChatSession, 
    userMessage: string, 
    imageFile: File | null
): Promise<StructuredAIResponse> => {
    
    // Inject Profile Context
    const healthContext = await getHealthContextBlock();

    // Construct context from session history
    const contextPrompt = `
    ${healthContext}

    Patient Profile: ${JSON.stringify(session.patientSummary)}
    
    History of present conversation:
    ${session.messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}
    
    Current User Query: ${userMessage}
    `;

    // Strict Schema Definition
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "Conversational text response." },
        riskLevel: { type: Type.STRING, enum: ["low", "moderate", "emergency"], description: "Overall risk assessment" },
        differentialDiagnosis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              confidence: { type: Type.NUMBER, description: "0-100 score" },
            },
            required: ["condition", "reasoning", "confidence"]
          }
        },
        recommendedActions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        suggestedMedications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    form: { type: Type.STRING, enum: ["tablet", "syrup", "cream", "ointment"] },
                    strength: { type: Type.STRING },
                    dose: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    timing: { type: Type.STRING },
                    maxDailyDose: { type: Type.STRING },
                    ageLimit: { type: Type.STRING },
                    contraindications: { type: Type.ARRAY, items: { type: Type.STRING } },
                    notes: { type: Type.STRING }
                },
                required: ["name", "form", "dose", "frequency", "timing"]
            },
            description: "Suggested OTC medicines. Must be empty if riskLevel is emergency."
        },
        redFlags: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        confidenceScore: { type: Type.NUMBER, description: "Overall confidence 0-100" }
      },
      required: ["summary", "riskLevel", "differentialDiagnosis", "recommendedActions", "suggestedMedications", "confidenceScore"]
    };

    const SYSTEM_INSTRUCTION = `
    You are a CALM, EXPERIENCED, and KIND medical assistant.
    
    CORE RULES:
    1. **Calmness First**: Never use scary words like "heart attack" or "deadly" immediately.
    2. **Reassurance**: Start by reassuring the patient.
    3. **Safe Meds**: If symptoms are mild, suggest OTC medicines. ALWAYS include Name, Dose, Frequency, and Timing.
    4. **Emergency**: If symptoms are severe, set riskLevel to "emergency" and advise seeing a doctor CALMLY. "It would be best to have a doctor check this."
    5. **No Meds in Emergency**: If riskLevel is "emergency", suggestedMedications MUST be empty.
    
    OUTPUT:
    Return a strict JSON object.
    `;

    try {
        const parts: any[] = [{ text: contextPrompt }];

        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parts.push(imagePart);
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: { 
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 0.3 
            }
        });

        if (!response.text) throw new Error("Empty response");
        
        return JSON.parse(response.text) as StructuredAIResponse;

    } catch (error) {
        console.error("Chat AI Error", error);
        return {
            summary: "I'm having a little trouble connecting to my medical database right now. Please try asking again in a moment. If you are in pain, try to rest comfortably.",
            riskLevel: "low",
            differentialDiagnosis: [],
            recommendedActions: ["Consult a doctor if urgent", "Try again later"],
            suggestedMedications: [],
            redFlags: [],
            confidenceScore: 0
        };
    }
};

/**
 * Finds nearby care places using Gemini grounded in Google Maps.
 */
export const findNearbyPlaces = async (
  lat: number, 
  lng: number, 
  queryType: 'Hospital' | 'Pharmacy' | 'Both',
  radiusKm: number,
  manualLocation?: string
): Promise<CarePlace[]> => {

  const locationStr = manualLocation ? manualLocation : `${lat}, ${lng}`;
  const typeStr = queryType === 'Both' ? 'Hospitals and Pharmacies' : queryType + 's';

  const prompt = `
  I am currently at location: ${locationStr}.
  Please find the nearest ${typeStr} within ${radiusKm} km of me using Google Maps.
  
  Return a strict JSON array of objects. Do not include markdown code blocks.
  Each object should have:
  - name (string)
  - type (string: Hospital, Pharmacy, Clinic, or Other)
  - address (string: full address)
  - distanceKm (number: estimate distance from my location)
  - rating (number: 1-5, 0 if unavailable)
  - userRatingsTotal (number)
  - isOpenNow (boolean)
  - openingHours (string: brief summary e.g. "Open 24 hours" or "Closes 9PM")
  - phoneNumber (string: formatted phone number)
  - googleMapsUrl (string: link to the place on maps)
  - summary (string: a very short 10-word description of quality or specialty grounded in reviews/metadata)
  - priorityScore (number: 0-100 score based on distance, rating, and open status. High score for open, close, and highly rated.)
  - isTopRecommendation (boolean: set to true ONLY for the single best option in the list)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleMaps: {} }],
      }
    });
    
    const text = response.text || "[]";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let places = JSON.parse(jsonStr);
    
    return places.map((p: any, idx: number) => ({
      ...p,
      id: p.id || `place-${idx}-${Date.now()}`
    })) as CarePlace[];

  } catch (error) {
    console.error("Care Finder AI Error", error);
    return [];
  }
};

/**
 * Generates a short, friendly family alert message in the target language.
 */
export const generateFamilyMessage = async (
  medicalSummary: string,
  patientName: string,
  language: string
): Promise<string> => {

  // Inject Profile Context
  const healthContext = await getHealthContextBlock();

  const prompt = `
  ${healthContext}
  
  You are a helpful assistant assisting a patient named "${patientName || 'User'}".
  
  The patient has the following medical status summary:
  "${medicalSummary}"

  Write a short, natural, and reassuring WhatsApp/SMS message from the patient to their family member.
  
  Requirements:
  - Language: ${language} (If Hindi or Marathi, use natural script but easy to read).
  - Tone: Personal, calm, informative, not alarming.
  - Content: State briefly what the issue is, what the AI tool said, and next steps.
  - Length: Under 50 words.
  - If the Health Profile indicates specific preferred language, prioritize that if "language" parameter is generic.
  - End with a reassuring emoji.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.7,
      }
    });
    return response.text?.trim() || "Could not generate message.";
  } catch (error) {
    console.error("Family Message AI Error", error);
    return `Hi, this is ${patientName}. I used MedScan AI. Here is my status: ${medicalSummary}`;
  }
};
