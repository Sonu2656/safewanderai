// Emergency numbers by ISO country code (curated common cases)
// Sources: official emergency services / Wikipedia
export type EmergencyNumbers = {
  general?: string;
  police?: string;
  ambulance?: string;
  fire?: string;
};

const NUMBERS: Record<string, EmergencyNumbers> = {
  US: { general: "911", police: "911", ambulance: "911", fire: "911" },
  CA: { general: "911", police: "911", ambulance: "911", fire: "911" },
  GB: { general: "999", police: "999", ambulance: "999", fire: "999" },
  IE: { general: "112", police: "999", ambulance: "999", fire: "999" },
  AU: { general: "000", police: "000", ambulance: "000", fire: "000" },
  NZ: { general: "111", police: "111", ambulance: "111", fire: "111" },
  IN: { general: "112", police: "100", ambulance: "102", fire: "101" },
  PK: { general: "15", police: "15", ambulance: "115", fire: "16" },
  BD: { general: "999", police: "999", ambulance: "999", fire: "999" },
  LK: { general: "119", police: "119", ambulance: "1990", fire: "110" },
  NP: { general: "100", police: "100", ambulance: "102", fire: "101" },
  CN: { general: "110", police: "110", ambulance: "120", fire: "119" },
  JP: { general: "110", police: "110", ambulance: "119", fire: "119" },
  KR: { general: "112", police: "112", ambulance: "119", fire: "119" },
  TH: { general: "191", police: "191", ambulance: "1669", fire: "199" },
  VN: { general: "113", police: "113", ambulance: "115", fire: "114" },
  ID: { general: "112", police: "110", ambulance: "118", fire: "113" },
  MY: { general: "999", police: "999", ambulance: "999", fire: "994" },
  SG: { general: "999", police: "999", ambulance: "995", fire: "995" },
  PH: { general: "911", police: "911", ambulance: "911", fire: "911" },
  AE: { general: "999", police: "999", ambulance: "998", fire: "997" },
  SA: { general: "911", police: "999", ambulance: "997", fire: "998" },
  TR: { general: "112", police: "155", ambulance: "112", fire: "110" },
  IL: { general: "112", police: "100", ambulance: "101", fire: "102" },
  EG: { general: "122", police: "122", ambulance: "123", fire: "180" },
  ZA: { general: "112", police: "10111", ambulance: "10177", fire: "10177" },
  KE: { general: "999", police: "999", ambulance: "999", fire: "999" },
  NG: { general: "112", police: "112", ambulance: "112", fire: "112" },
  MA: { general: "112", police: "19", ambulance: "15", fire: "15" },
  FR: { general: "112", police: "17", ambulance: "15", fire: "18" },
  DE: { general: "112", police: "110", ambulance: "112", fire: "112" },
  ES: { general: "112", police: "091", ambulance: "061", fire: "080" },
  IT: { general: "112", police: "113", ambulance: "118", fire: "115" },
  PT: { general: "112", police: "112", ambulance: "112", fire: "112" },
  NL: { general: "112", police: "112", ambulance: "112", fire: "112" },
  BE: { general: "112", police: "101", ambulance: "112", fire: "112" },
  CH: { general: "112", police: "117", ambulance: "144", fire: "118" },
  AT: { general: "112", police: "133", ambulance: "144", fire: "122" },
  GR: { general: "112", police: "100", ambulance: "166", fire: "199" },
  PL: { general: "112", police: "997", ambulance: "999", fire: "998" },
  CZ: { general: "112", police: "158", ambulance: "155", fire: "150" },
  HU: { general: "112", police: "107", ambulance: "104", fire: "105" },
  SE: { general: "112", police: "112", ambulance: "112", fire: "112" },
  NO: { general: "112", police: "112", ambulance: "113", fire: "110" },
  DK: { general: "112", police: "114", ambulance: "112", fire: "112" },
  FI: { general: "112", police: "112", ambulance: "112", fire: "112" },
  IS: { general: "112", police: "112", ambulance: "112", fire: "112" },
  RU: { general: "112", police: "102", ambulance: "103", fire: "101" },
  UA: { general: "112", police: "102", ambulance: "103", fire: "101" },
  MX: { general: "911", police: "911", ambulance: "911", fire: "911" },
  BR: { general: "190", police: "190", ambulance: "192", fire: "193" },
  AR: { general: "911", police: "911", ambulance: "107", fire: "100" },
  CL: { general: "133", police: "133", ambulance: "131", fire: "132" },
  CO: { general: "123", police: "123", ambulance: "125", fire: "119" },
  PE: { general: "105", police: "105", ambulance: "117", fire: "116" },
};

export function getEmergencyNumbers(countryCode?: string): EmergencyNumbers {
  if (!countryCode) return { general: "112" };
  const c = countryCode.toUpperCase();
  return NUMBERS[c] || { general: "112" };
}
