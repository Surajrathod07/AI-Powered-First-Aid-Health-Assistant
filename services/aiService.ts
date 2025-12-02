import { GoogleGenAI } from "@google/genai";
import { AnalysisRequest } from "../types";

// Initialize the client
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

  // 1. Construct the Structured Prompt
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
  5. If the image is unclear or low quality, state this clearly in the findings.
  `;

  try {
    const parts: any[] = [{ text: prompt }];

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }

    // Use Gemini 3 Pro Image Preview for high-fidelity medical image analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: "You are a helpful, safety-conscious medical AI assistant. You provide information for educational and informational purposes only. You are not a doctor.",
        temperature: 0.4, // Lower temperature for more analytical/factual responses
      }
    });

    return response.text || "Unable to generate report. Please try again.";

  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to analyze data. Please check your connection and try again.");
  }
};
