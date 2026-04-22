// Local-only extras stored alongside the Supabase profile for privacy.
export type ProfileExtras = {
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_type: string;
  allergies: string;
  medical_notes: string;
  home_country: string;
  bio: string;
};

const KEY = "safewander.profile.extras";

export const getProfileExtras = (userId?: string | null): ProfileExtras | null => {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`${KEY}.${userId}`);
    return raw ? (JSON.parse(raw) as ProfileExtras) : null;
  } catch {
    return null;
  }
};
