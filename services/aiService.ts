
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisRequest, ChatSession, StructuredAIResponse, CarePlace, Contact } from "../types";

// Initialize the client
// Using gemini-2.5-flash which is generally available and supports vision
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string for the API.
 */
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
 */
export const generateMedicalReport = async (request: AnalysisRequest): Promise<string> => {
  const { patientDetails, clinicalContext, imageFile } = request;

  const prompt = `
  You are an expert medical consultant and senior radiologist AI. Your task is to analyze the provided patient details, clinical context, and optional medical imaging to produce a professional, structured medical report.

  --- PATIENT DETAILS ---
  • Name: ${patientDetails.name || "Not provided"}
  • Age Group: ${patientDetails.ageGroup}
  • Sex: ${patientDetails.sex}
  • Symptom Type: ${patientDetails.symptomType}
  • Duration: ${patientDetails.duration}
  • Pain Severity: ${patientDetails.painSeverity}

  --- CLINICAL CONTEXT ---
  ${clinicalContext || "No additional context provided."}

  --- REQUESTED OUTPUT FOCUS ---
  ${patientDetails.reportFocus}

  --- INSTRUCTIONS ---
  1. Analyze the inputs carefully. If an image is provided, act as a radiologist (X-ray, CT, MRI, Ultrasound specialist) and describe findings in technical detail.
  2. Generate a structured report with the following sections (adapt based on the "Requested Output Focus"):
     - **Title / Clinical Brief**: Summary of the case.
     - **Image Findings**: (If image provided) Technical description of structures, abnormalities, or lack thereof.
     - **Interpretation / Clinical Significance**: What does this mean clinically?
     - **Possible Differential Diagnosis**: List potential causes ordered by likelihood.
     - **Recommended Follow-up**: Next steps, tests, or specialist referrals.
     - **Urgency Assessment**: Scale 0-5 with a clear action message (e.g., "Seek emergency care").
     - **Layman Explanation**: A simple summary for non-medical users.
     - **Safety Disclaimer**: Standard medical disclaimer.
  3. Use cautious medical language ("suggests", "is consistent with", "could represent"). NEVER claim 100% certainty.
  4. DO NOT recommend specific prescription drug dosages or brand names. Suggest general classes of treatment (e.g., "anti-inflammatories", "rest", "immobilization").
  `;

  try {
    const parts: any[] = [{ text: prompt }];

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: "You are a helpful, safety-conscious medical AI assistant. You provide information for educational and informational purposes only. You are not a doctor.",
        temperature: 0.4, 
      }
    });

    return response.text || "Unable to generate report. Please try again.";

  } catch (error: any) {
    console.error("AI Service Error:", error);
    if (error.message?.includes('403') || error.status === 403) {
        throw new Error("Access denied. The API key may be invalid or lacks permission for this model.");
    }
    throw new Error("Failed to analyze data. Please check your connection and try again.");
  }
};


/**
 * Chat functionality for the Clinical Assistant module.
 * Returns a JSON object to populate the structured UI.
 */
export const chatWithMedicalAI = async (
    session: ChatSession, 
    userMessage: string, 
    imageFile: File | null
): Promise<StructuredAIResponse> => {
    
    // Construct context from session history
    const contextPrompt = `
    Patient Profile: ${JSON.stringify(session.patientSummary)}
    
    History of present conversation:
    ${session.messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}
    
    Current User Query: ${userMessage}
    `;

    // Strict Schema Definition
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "Main conversational text response (human friendly, 2-3 sentences max)" },
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
          items: { type: Type.STRING }
        },
        redFlags: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        confidenceScore: { type: Type.NUMBER, description: "Overall confidence 0-100" }
      },
      required: ["summary", "differentialDiagnosis", "recommendedActions", "confidenceScore"]
    };

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
                systemInstruction: "You are an AI Clinical Assistant. Provide a helpful, accurate, and safe medical response. Return your answer strictly as a JSON object adhering to the schema. Do not provide specific dosages. Do not diagnose definitively.",
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 0.2 // Lower temperature for more deterministic JSON
            }
        });

        if (!response.text) throw new Error("Empty response");
        
        // Parse JSON
        return JSON.parse(response.text) as StructuredAIResponse;

    } catch (error) {
        console.error("Chat AI Error", error);
        // Fallback response structure
        return {
            summary: "I'm having trouble connecting to the medical knowledge base right now. Please try again or seek professional care if urgent.",
            differentialDiagnosis: [],
            recommendedActions: ["Consult a doctor", "Try again later"],
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
        // Note: responseSchema + googleMaps tool can be unstable in some versions, 
        // so we rely on prompt engineering for JSON output here.
      }
    });
    
    const text = response.text || "[]";
    
    // Attempt to clean markdown if present (e.g. ```json ... ```)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let places = JSON.parse(jsonStr);
    
    // Add IDs if missing and sanitise
    return places.map((p: any, idx: number) => ({
      ...p,
      id: p.id || `place-${idx}-${Date.now()}`
    })) as CarePlace[];

  } catch (error) {
    console.error("Care Finder AI Error", error);
    // Return empty array instead of crashing, UI will handle empty state
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
  const prompt = `
  You are a helpful assistant assisting a patient named "${patientName || 'User'}".
  
  The patient has the following medical status summary:
  "${medicalSummary}"

  Write a short, natural, and reassuring WhatsApp/SMS message from the patient to their family member.
  
  Requirements:
  - Language: ${language} (If Hindi or Marathi, use natural script but easy to read, or mixed english-script if common).
  - Tone: Personal, calm, informative, not alarming.
  - Content: State briefly what the issue is, what the AI tool said (briefly), and next steps (e.g., "I will rest" or "Going to doctor").
  - Length: Under 50 words.
  - End with a reassuring emoji if appropriate.
  - Do NOT include "Subject:" lines or formal headers. Just the message body.
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
