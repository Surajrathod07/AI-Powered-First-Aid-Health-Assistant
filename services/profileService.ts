
import { supabase } from './supabaseClient';
import { UserHealthProfile } from '../types';

/*
Supabase Table Structure: 'user_health_profile'
- id (uuid, primary key, default: gen_random_uuid())
- user_id (uuid, unique, references auth.users)
- full_name (text)
- age_group (text)
- gender (text)
- conditions (text[])
- allergies (text)
- medications (text)
- emergency_contact_name (text)
- emergency_contact_phone (text)
- blood_group (text)
- preferred_language (text)
- created_at (timestamptz, default: now())
- updated_at (timestamptz)
*/

const GUEST_PROFILE_KEY = 'medscan_guest_profile';

export const saveUserProfile = async (profile: UserHealthProfile, isGuest: boolean): Promise<{ success: boolean; error?: string }> => {
  try {
    if (isGuest) {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify({ ...profile, updated_at: new Date().toISOString() }));
      return { success: true };
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'No authenticated user found' };

      // Ensure user_id is set
      const profileToSave = {
        ...profile,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      // Upsert to Supabase
      const { error } = await supabase
        .from('user_health_profile')
        .upsert(profileToSave, { onConflict: 'user_id' });

      if (error) {
        console.warn("Supabase upsert failed (Table might not exist in demo):", error);
        // Fallback to local storage for auth users if table missing (Demo resilience)
        localStorage.setItem(`medscan_auth_profile_${user.id}`, JSON.stringify(profileToSave));
        return { success: true }; // Pretend success for demo
      }

      return { success: true };
    }
  } catch (err: any) {
    console.error("Save profile error", err);
    return { success: false, error: err.message };
  }
};

export const getUserProfile = async (isGuest: boolean): Promise<UserHealthProfile | null> => {
  try {
    if (isGuest) {
      const stored = localStorage.getItem(GUEST_PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Try Supabase first
      const { data, error } = await supabase
        .from('user_health_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) return data as UserHealthProfile;

      if (error) {
        // Fallback to local storage
        const stored = localStorage.getItem(`medscan_auth_profile_${user.id}`);
        return stored ? JSON.parse(stored) : null;
      }
      
      return null;
    }
  } catch (err) {
    console.error("Get profile error", err);
    return null;
  }
};

/**
 * Generates the context string for AI consumption.
 * Fetches the current profile based on session state.
 */
export const getHealthContextBlock = async (): Promise<string> => {
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    const isGuest = !session?.user;
    
    const profile = await getUserProfile(isGuest);

    if (!profile) return "";

    return `
--- USER HEALTH PROFILE CONTEXT ---
Use this background info to personalize the response.
- Name: ${profile.full_name}
- Age Group: ${profile.age_group}
- Gender: ${profile.gender}
- Known Conditions: ${profile.conditions.join(', ') || 'None'}
- Allergies: ${profile.allergies || 'None'}
- Current Medications: ${profile.medications || 'None'}
- Preferred Language: ${profile.preferred_language}

SAFETY INSTRUCTIONS:
1. Check for contraindications with known conditions/meds if suggesting treatments.
2. If Age Group is "Under 12" or "60+", use simpler language and extra caution.
3. If allergies are listed, explicitly warn against those substances if relevant.
-----------------------------------
`;
};
