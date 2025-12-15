
import { jsPDF } from "jspdf";
import { ChatSession, ReportPayload, SuggestedMedicine } from "../types";

/**
 * Downloads the report data as a machine-readable JSON file.
 */
export const downloadReportJson = (payload: ReportPayload) => {
    const filename = `MedScan_Report_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${payload.patient.name || 'Anon'}.json`;
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Generates a structured clinical PDF report based on the payload (7 Sections).
 */
export const generateReportPdf = async (payload: ReportPayload) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPos = 20;

    // --- HEADER ---
    doc.setFillColor(6, 182, 212); // Cyan 500
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Medical Summary Report", margin, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date(payload.generatedAt).toLocaleDateString()}`, pageWidth - margin, 20, { align: "right" });

    yPos = 45;

    // --- SECTION 1: Patient Information ---
    addSectionHeader(doc, "1. Patient Information", margin, yPos);
    yPos += 10;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Name:`, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(payload.patient.name || "Anonymous", margin + 30, yPos);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Age:`, margin + 100, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${payload.patient.ageYears} years`, margin + 115, yPos);
    
    yPos += 8;
    
    doc.setFont("helvetica", "bold");
    doc.text(`Sex:`, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(payload.patient.sex || "Not specified", margin + 30, yPos);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Date:`, margin + 100, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString(), margin + 115, yPos);

    yPos += 15;

    // --- SECTION 2: Reported Symptoms ---
    addSectionHeader(doc, "2. Reported Symptoms", margin, yPos);
    yPos += 10;
    yPos = addWrapText(doc, payload.clinicalSummary, margin, yPos, contentWidth, 11);
    yPos += 5;

    // --- SECTION 3: Possible Causes (Non-alarming) ---
    addSectionHeader(doc, "3. Possible Causes", margin, yPos);
    yPos += 10;
    if (payload.possibleCauses && payload.possibleCauses.length > 0) {
        payload.possibleCauses.forEach(cause => {
            doc.setFont("helvetica", "bold");
            doc.text(`• ${cause.name}`, margin, yPos);
            doc.setFont("helvetica", "normal");
            // Optional confidence if available
            if (cause.confidence) {
                doc.setTextColor(100, 100, 100);
                doc.text(` - ${cause.confidence}`, margin + doc.getTextWidth(`• ${cause.name}`), yPos);
                doc.setTextColor(0, 0, 0);
            }
            yPos += 7;
        });
    } else {
        doc.text("No specific causes identified.", margin, yPos);
        yPos += 7;
    }
    yPos += 5;

    // --- SECTION 4: Suggested Medicines ---
    addSectionHeader(doc, "4. Suggested Medicines (OTC Only)", margin, yPos);
    yPos += 10;
    
    if (payload.riskLevel === 'emergency') {
        doc.setTextColor(200, 0, 0);
        doc.setFont("helvetica", "italic");
        doc.text("Medicines omitted due to emergency risk. Please consult a doctor immediately.", margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
    } else if (payload.suggestedMedicines && payload.suggestedMedicines.length > 0) {
        
        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Medicine", margin + 2, yPos + 1);
        doc.text("Dosage", margin + 60, yPos + 1);
        doc.text("Timing", margin + 120, yPos + 1);
        yPos += 10;

        doc.setFont("helvetica", "normal");
        payload.suggestedMedicines.forEach(med => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }

            const name = `${med.name} (${med.form})`;
            const dose = `${med.dose} - ${med.frequency}`;
            const timing = `${med.timing}`;

            doc.text(name, margin + 2, yPos);
            doc.text(dose, margin + 60, yPos);
            doc.text(timing, margin + 120, yPos);
            
            yPos += 8;
            doc.setDrawColor(230, 230, 230);
            doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4);
        });
    } else {
        doc.setFont("helvetica", "italic");
        doc.text("No specific medicines suggested for this condition.", margin, yPos);
        yPos += 10;
    }
    doc.setFont("helvetica", "normal");
    yPos += 5;

    // --- SECTION 5: Home Care & Self-Care Advice ---
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    addSectionHeader(doc, "5. Home Care Advice", margin, yPos);
    yPos += 10;
    if (payload.recommendedActions && payload.recommendedActions.length > 0) {
        payload.recommendedActions.forEach(action => {
            yPos = addWrapText(doc, `• ${action}`, margin, yPos, contentWidth, 11);
            yPos += 2;
        });
    } else {
        doc.text("Rest and hydration recommended.", margin, yPos);
        yPos += 7;
    }
    yPos += 5;

    // --- SECTION 6: When to See a Doctor ---
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    addSectionHeader(doc, "6. When to See a Doctor", margin, yPos);
    yPos += 10;
    if (payload.redFlags && payload.redFlags.length > 0) {
        payload.redFlags.forEach(flag => {
            doc.setTextColor(180, 0, 0); // Slight red tint but not screaming
            yPos = addWrapText(doc, `• ${flag}`, margin, yPos, contentWidth, 11);
            yPos += 2;
        });
    } else {
        doc.text("If symptoms persist or worsen, consult a doctor.", margin, yPos);
        yPos += 7;
    }
    doc.setTextColor(0, 0, 0);
    yPos += 10;

    // --- SECTION 7: Disclaimer ---
    if (yPos > 260) { doc.addPage(); yPos = 20; }
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text("7. Medical Disclaimer", margin, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    const disclaimer = payload.disclaimer || "This report is generated by AI for informational purposes only. It does not constitute a medical diagnosis or prescription. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.";
    yPos = addWrapText(doc, disclaimer, margin, yPos, contentWidth, 8);


    // Save
    const filename = `MedScan_Report_${payload.patient.name || 'Patient'}.pdf`;
    doc.save(filename);
};

// Helper for Section Headers
const addSectionHeader = (doc: jsPDF, text: string, x: number, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 160); // Professional Blue
    doc.text(text, x, y);
    doc.setDrawColor(0, 100, 160);
    doc.line(x, y + 2, x + 170, y + 2); // Underline
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
};

// Helper for Wrapping Text with return Y
const addWrapText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, fontSize: number): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.45)) + 2; 
};

// Chat Export Upgrade: Generate structured report if available
export const generatePDF = async (session: ChatSession) => {
    // Check if we have a structured response from the model
    const lastStructuredResponse = [...session.messages].reverse().find(m => m.role === 'model' && m.structuredResponse)?.structuredResponse;

    if (lastStructuredResponse) {
        // Map Chat Session to Report Payload
        const payload: ReportPayload = {
            reportId: `chat-rep-${session.id.slice(-6)}`,
            generatedAt: new Date().toISOString(),
            patient: {
                name: session.patientSummary.name || 'Patient',
                ageYears: session.patientSummary.age,
                sex: session.patientSummary.sex
            },
            riskLevel: lastStructuredResponse.riskLevel || 'moderate',
            clinicalSummary: lastStructuredResponse.summary,
            possibleCauses: lastStructuredResponse.differentialDiagnosis.map(d => ({
                name: d.condition,
                confidence: `${d.confidence}%`
            })),
            suggestedMedicines: lastStructuredResponse.suggestedMedications, // Types match now
            recommendedActions: lastStructuredResponse.recommendedActions,
            redFlags: lastStructuredResponse.redFlags,
            disclaimer: "This report is based on a chat consultation with MedScan AI. It is not a replacement for professional medical advice.",
            generatedBy: "MedScan AI - Clinical Chat"
        };
        
        await generateReportPdf(payload);
    } else {
        // Fallback for empty or error sessions
        const doc = new jsPDF();
        doc.text("Consultation Transcript", 10, 10);
        doc.setFontSize(10);
        session.messages.forEach((m, i) => {
            const line = `${m.role.toUpperCase()} (${new Date(m.timestamp).toLocaleTimeString()}): ${m.text.substring(0, 80)}...`;
            doc.text(line, 10, 20 + (i * 10));
        });
        doc.save(`MedScan_Chat_${session.id}.pdf`);
    }
};
