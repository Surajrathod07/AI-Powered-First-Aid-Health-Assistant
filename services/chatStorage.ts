
import { ChatSession, Sex, SymptomType, Duration, PainSeverity, ReportFocus } from '../types';

const STORAGE_KEY = 'medscan_chat_sessions';
const ACTIVE_SESSION_KEY = 'medscan_active_session_id';

// Helper to create a fresh session
export const createNewSession = (): ChatSession => {
  const now = Date.now();
  return {
    id: now.toString(),
    title: 'New Consultation',
    startTime: now,
    lastUpdated: now,
    messages: [],
    patientSummary: {
      name: '',
      age: 0, 
      sex: Sex.MALE,
      symptomType: SymptomType.OTHER,
      duration: Duration.DAYS,
      painSeverity: PainSeverity.MILD,
      reportFocus: ReportFocus.LAYMAN
    }
  };
};

// Get all sessions sorted by lastUpdated desc
export const getAllSessions = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions: ChatSession[] = JSON.parse(raw);
    return sessions.sort((a, b) => b.lastUpdated - a.lastUpdated);
  } catch (e) {
    console.error("Failed to load sessions", e);
    return [];
  }
};

// Save or Update a session
export const saveSession = (session: ChatSession): void => {
  try {
    const sessions = getAllSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    // Set as active
    localStorage.setItem(ACTIVE_SESSION_KEY, session.id);
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

// Delete a session
export const deleteSession = (sessionId: string): void => {
  try {
    const sessions = getAllSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // If deleted session was active, clear active key
    const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (activeId === sessionId) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (e) {
    console.error("Failed to delete session", e);
  }
};

// Get specific session
export const getSessionById = (id: string): ChatSession | undefined => {
  const sessions = getAllSessions();
  return sessions.find(s => s.id === id);
};

// Get last active session or create new
export const getLastActiveOrNewSession = (): ChatSession => {
  const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (activeId) {
    const session = getSessionById(activeId);
    if (session) return session;
  }
  
  // If no active ID, check if there are any sessions at all
  const sessions = getAllSessions();
  if (sessions.length > 0) {
    return sessions[0];
  }

  // Create new
  return createNewSession();
};
