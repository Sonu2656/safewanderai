// Country travel essentials: plug type, voltage, drive side, tap water, visa hint, currency, tipping, language code.
// Keyed by ISO 3166-1 alpha-2 country code (uppercase).
export type CountryEssentials = {
  currency: string;        // ISO 4217
  currencySymbol: string;
  language: string;        // BCP-47 ish, used for phrasebook
  languageLabel: string;
  plug: string;            // e.g. "Type A/B"
  voltage: string;         // e.g. "120V / 60Hz"
  driveSide: "left" | "right";
  tapWater: "safe" | "risky" | "unsafe";
  tipping: string;         // short etiquette line
  visaHint: string;        // generic visa note
};

export const COUNTRY_ESSENTIALS: Record<string, CountryEssentials> = {
  US: { currency: "USD", currencySymbol: "$", language: "en", languageLabel: "English", plug: "Type A/B", voltage: "120V · 60Hz", driveSide: "right", tapWater: "safe", tipping: "15–20% expected at restaurants", visaHint: "ESTA / B-visa for most travellers" },
  GB: { currency: "GBP", currencySymbol: "£", language: "en", languageLabel: "English", plug: "Type G", voltage: "230V · 50Hz", driveSide: "left", tapWater: "safe", tipping: "10–12.5% if not on bill", visaHint: "Visa-free or ETA for many; check gov.uk" },
  FR: { currency: "EUR", currencySymbol: "€", language: "fr", languageLabel: "French", plug: "Type C/E", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "Service included; round up", visaHint: "Schengen — 90/180 days for many" },
  DE: { currency: "EUR", currencySymbol: "€", language: "de", languageLabel: "German", plug: "Type C/F", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "5–10% appreciated", visaHint: "Schengen — 90/180 days for many" },
  ES: { currency: "EUR", currencySymbol: "€", language: "es", languageLabel: "Spanish", plug: "Type C/F", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "Round up; 5–10% nice", visaHint: "Schengen — 90/180 days for many" },
  IT: { currency: "EUR", currencySymbol: "€", language: "it", languageLabel: "Italian", plug: "Type C/F/L", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "Coperto on bill; tip not required", visaHint: "Schengen — 90/180 days for many" },
  PT: { currency: "EUR", currencySymbol: "€", language: "pt", languageLabel: "Portuguese", plug: "Type C/F", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "5–10% appreciated", visaHint: "Schengen — 90/180 days for many" },
  NL: { currency: "EUR", currencySymbol: "€", language: "nl", languageLabel: "Dutch", plug: "Type C/F", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "Round up; 5–10% generous", visaHint: "Schengen — 90/180 days for many" },
  CH: { currency: "CHF", currencySymbol: "Fr", language: "de", languageLabel: "German/French/Italian", plug: "Type J", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "Service included; round up", visaHint: "Schengen — 90/180 days for many" },
  JP: { currency: "JPY", currencySymbol: "¥", language: "ja", languageLabel: "Japanese", plug: "Type A/B", voltage: "100V · 50/60Hz", driveSide: "left", tapWater: "safe", tipping: "Do NOT tip — can offend", visaHint: "Visa-free 90 days for many" },
  KR: { currency: "KRW", currencySymbol: "₩", language: "ko", languageLabel: "Korean", plug: "Type C/F", voltage: "220V · 60Hz", driveSide: "right", tapWater: "safe", tipping: "Not customary", visaHint: "K-ETA for many; 90 days" },
  CN: { currency: "CNY", currencySymbol: "¥", language: "zh", languageLabel: "Mandarin", plug: "Type A/C/I", voltage: "220V · 50Hz", driveSide: "right", tapWater: "unsafe", tipping: "Not expected", visaHint: "Visa often required; check policy" },
  IN: { currency: "INR", currencySymbol: "₹", language: "hi", languageLabel: "Hindi/English", plug: "Type C/D/M", voltage: "230V · 50Hz", driveSide: "left", tapWater: "unsafe", tipping: "10% at restaurants; ₹50–100 hotel", visaHint: "e-Visa available for many" },
  TH: { currency: "THB", currencySymbol: "฿", language: "th", languageLabel: "Thai", plug: "Type A/B/C", voltage: "220V · 50Hz", driveSide: "left", tapWater: "unsafe", tipping: "Round up; 10% upscale", visaHint: "Visa-free 30–60 days for many" },
  ID: { currency: "IDR", currencySymbol: "Rp", language: "id", languageLabel: "Indonesian", plug: "Type C/F", voltage: "230V · 50Hz", driveSide: "left", tapWater: "unsafe", tipping: "Service charge often added", visaHint: "Visa-on-arrival for many" },
  VN: { currency: "VND", currencySymbol: "₫", language: "vi", languageLabel: "Vietnamese", plug: "Type A/C/F", voltage: "220V · 50Hz", driveSide: "right", tapWater: "unsafe", tipping: "Not required; appreciated", visaHint: "e-Visa available; 90 days" },
  SG: { currency: "SGD", currencySymbol: "S$", language: "en", languageLabel: "English", plug: "Type G", voltage: "230V · 50Hz", driveSide: "left", tapWater: "safe", tipping: "Service charge added; no tip", visaHint: "Visa-free 30–90 days for many" },
  MY: { currency: "MYR", currencySymbol: "RM", language: "ms", languageLabel: "Malay", plug: "Type G", voltage: "240V · 50Hz", driveSide: "left", tapWater: "risky", tipping: "Service charge common", visaHint: "Visa-free 90 days for many" },
  AE: { currency: "AED", currencySymbol: "د.إ", language: "ar", languageLabel: "Arabic", plug: "Type G", voltage: "230V · 50Hz", driveSide: "right", tapWater: "risky", tipping: "10–15% common", visaHint: "Visa-free or on-arrival for many" },
  TR: { currency: "TRY", currencySymbol: "₺", language: "tr", languageLabel: "Turkish", plug: "Type C/F", voltage: "230V · 50Hz", driveSide: "right", tapWater: "risky", tipping: "5–10% at restaurants", visaHint: "e-Visa for many" },
  EG: { currency: "EGP", currencySymbol: "E£", language: "ar", languageLabel: "Arabic", plug: "Type C/F", voltage: "220V · 50Hz", driveSide: "right", tapWater: "unsafe", tipping: "Baksheesh culture: small tips often", visaHint: "Visa-on-arrival or e-Visa" },
  MA: { currency: "MAD", currencySymbol: "د.م.", language: "ar", languageLabel: "Arabic", plug: "Type C/E", voltage: "220V · 50Hz", driveSide: "right", tapWater: "unsafe", tipping: "10% restaurants; small tips common", visaHint: "Visa-free 90 days for many" },
  ZA: { currency: "ZAR", currencySymbol: "R", language: "en", languageLabel: "English", plug: "Type M/N", voltage: "230V · 50Hz", driveSide: "left", tapWater: "safe", tipping: "10–15% expected", visaHint: "Visa-free 90 days for many" },
  KE: { currency: "KES", currencySymbol: "KSh", language: "sw", languageLabel: "Swahili/English", plug: "Type G", voltage: "240V · 50Hz", driveSide: "left", tapWater: "unsafe", tipping: "10% common", visaHint: "e-Visa required" },
  BR: { currency: "BRL", currencySymbol: "R$", language: "pt", languageLabel: "Portuguese", plug: "Type N", voltage: "127/220V · 60Hz", driveSide: "right", tapWater: "risky", tipping: "10% often added", visaHint: "Visa-free for many; check policy" },
  AR: { currency: "ARS", currencySymbol: "$", language: "es", languageLabel: "Spanish", plug: "Type C/I", voltage: "220V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "10% at restaurants", visaHint: "Visa-free 90 days for many" },
  MX: { currency: "MXN", currencySymbol: "$", language: "es", languageLabel: "Spanish", plug: "Type A/B", voltage: "127V · 60Hz", driveSide: "right", tapWater: "unsafe", tipping: "10–15% expected", visaHint: "Visa-free 180 days for many" },
  CA: { currency: "CAD", currencySymbol: "C$", language: "en", languageLabel: "English/French", plug: "Type A/B", voltage: "120V · 60Hz", driveSide: "right", tapWater: "safe", tipping: "15–20% expected", visaHint: "eTA for many flights" },
  AU: { currency: "AUD", currencySymbol: "A$", language: "en", languageLabel: "English", plug: "Type I", voltage: "230V · 50Hz", driveSide: "left", tapWater: "safe", tipping: "Not required; round up", visaHint: "ETA / eVisitor for many" },
  NZ: { currency: "NZD", currencySymbol: "NZ$", language: "en", languageLabel: "English", plug: "Type I", voltage: "230V · 50Hz", driveSide: "left", tapWater: "safe", tipping: "Not customary", visaHint: "NZeTA required for many" },
  IS: { currency: "ISK", currencySymbol: "kr", language: "is", languageLabel: "Icelandic", plug: "Type C/F", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "Service included; no tip", visaHint: "Schengen — 90/180 days for many" },
  GR: { currency: "EUR", currencySymbol: "€", language: "el", languageLabel: "Greek", plug: "Type C/F", voltage: "230V · 50Hz", driveSide: "right", tapWater: "safe", tipping: "5–10% appreciated", visaHint: "Schengen — 90/180 days for many" },
};

export const getEssentials = (cc?: string | null): CountryEssentials | null => {
  if (!cc) return null;
  return COUNTRY_ESSENTIALS[cc.toUpperCase()] ?? null;
};

// Quick phrasebook by language code — 12 essentials
export type Phrase = { en: string; local: string; pron?: string };
export const PHRASEBOOK: Record<string, Phrase[]> = {
  en: [
    { en: "Hello", local: "Hello" }, { en: "Thank you", local: "Thank you" },
    { en: "Yes / No", local: "Yes / No" }, { en: "Please", local: "Please" },
    { en: "Sorry / Excuse me", local: "Sorry / Excuse me" }, { en: "Help!", local: "Help!" },
    { en: "I need a doctor", local: "I need a doctor" }, { en: "Call the police", local: "Call the police" },
    { en: "Where is...?", local: "Where is...?" }, { en: "How much?", local: "How much?" },
    { en: "I'm lost", local: "I'm lost" }, { en: "I don't understand", local: "I don't understand" },
  ],
  fr: [
    { en: "Hello", local: "Bonjour", pron: "bon-zhoor" }, { en: "Thank you", local: "Merci", pron: "mehr-see" },
    { en: "Yes / No", local: "Oui / Non" }, { en: "Please", local: "S'il vous plaît", pron: "seel voo pleh" },
    { en: "Sorry / Excuse me", local: "Pardon / Excusez-moi" }, { en: "Help!", local: "Au secours !", pron: "oh suh-koor" },
    { en: "I need a doctor", local: "J'ai besoin d'un médecin" }, { en: "Call the police", local: "Appelez la police" },
    { en: "Where is...?", local: "Où est...?", pron: "oo eh" }, { en: "How much?", local: "Combien ?", pron: "kom-byan" },
    { en: "I'm lost", local: "Je suis perdu(e)" }, { en: "I don't understand", local: "Je ne comprends pas" },
  ],
  es: [
    { en: "Hello", local: "Hola", pron: "oh-la" }, { en: "Thank you", local: "Gracias", pron: "grah-syas" },
    { en: "Yes / No", local: "Sí / No" }, { en: "Please", local: "Por favor" },
    { en: "Sorry / Excuse me", local: "Perdón / Disculpe" }, { en: "Help!", local: "¡Ayuda!", pron: "ah-yoo-da" },
    { en: "I need a doctor", local: "Necesito un médico" }, { en: "Call the police", local: "Llame a la policía" },
    { en: "Where is...?", local: "¿Dónde está...?" }, { en: "How much?", local: "¿Cuánto cuesta?" },
    { en: "I'm lost", local: "Estoy perdido/a" }, { en: "I don't understand", local: "No entiendo" },
  ],
  it: [
    { en: "Hello", local: "Ciao / Salve" }, { en: "Thank you", local: "Grazie", pron: "grah-tsyeh" },
    { en: "Yes / No", local: "Sì / No" }, { en: "Please", local: "Per favore" },
    { en: "Sorry / Excuse me", local: "Scusa / Mi scusi" }, { en: "Help!", local: "Aiuto!", pron: "ah-yoo-toh" },
    { en: "I need a doctor", local: "Ho bisogno di un medico" }, { en: "Call the police", local: "Chiami la polizia" },
    { en: "Where is...?", local: "Dov'è...?" }, { en: "How much?", local: "Quanto costa?" },
    { en: "I'm lost", local: "Mi sono perso/a" }, { en: "I don't understand", local: "Non capisco" },
  ],
  de: [
    { en: "Hello", local: "Hallo" }, { en: "Thank you", local: "Danke", pron: "dahn-keh" },
    { en: "Yes / No", local: "Ja / Nein" }, { en: "Please", local: "Bitte" },
    { en: "Sorry / Excuse me", local: "Entschuldigung" }, { en: "Help!", local: "Hilfe!", pron: "hil-feh" },
    { en: "I need a doctor", local: "Ich brauche einen Arzt" }, { en: "Call the police", local: "Rufen Sie die Polizei" },
    { en: "Where is...?", local: "Wo ist...?" }, { en: "How much?", local: "Wie viel kostet das?" },
    { en: "I'm lost", local: "Ich habe mich verlaufen" }, { en: "I don't understand", local: "Ich verstehe nicht" },
  ],
  pt: [
    { en: "Hello", local: "Olá" }, { en: "Thank you", local: "Obrigado/a", pron: "oh-bree-gah-doo" },
    { en: "Yes / No", local: "Sim / Não" }, { en: "Please", local: "Por favor" },
    { en: "Sorry / Excuse me", local: "Desculpe / Com licença" }, { en: "Help!", local: "Socorro!", pron: "soh-koh-rroo" },
    { en: "I need a doctor", local: "Preciso de um médico" }, { en: "Call the police", local: "Chame a polícia" },
    { en: "Where is...?", local: "Onde fica...?" }, { en: "How much?", local: "Quanto custa?" },
    { en: "I'm lost", local: "Estou perdido/a" }, { en: "I don't understand", local: "Não entendo" },
  ],
  nl: [
    { en: "Hello", local: "Hallo" }, { en: "Thank you", local: "Dank je / Dank u", pron: "dahnk yuh" },
    { en: "Yes / No", local: "Ja / Nee" }, { en: "Please", local: "Alstublieft" },
    { en: "Sorry / Excuse me", local: "Sorry / Pardon" }, { en: "Help!", local: "Help!" },
    { en: "I need a doctor", local: "Ik heb een dokter nodig" }, { en: "Call the police", local: "Bel de politie" },
    { en: "Where is...?", local: "Waar is...?" }, { en: "How much?", local: "Hoeveel kost het?" },
    { en: "I'm lost", local: "Ik ben verdwaald" }, { en: "I don't understand", local: "Ik begrijp het niet" },
  ],
  ja: [
    { en: "Hello", local: "こんにちは", pron: "kon-nee-chee-wa" }, { en: "Thank you", local: "ありがとう", pron: "a-ri-ga-toh" },
    { en: "Yes / No", local: "はい / いいえ", pron: "hai / iie" }, { en: "Please", local: "お願いします", pron: "o-ne-gai-shi-mas" },
    { en: "Sorry / Excuse me", local: "すみません", pron: "su-mi-ma-sen" }, { en: "Help!", local: "助けて!", pron: "tas-ke-te" },
    { en: "I need a doctor", local: "医者が必要です", pron: "i-sha ga hi-tsu-yoh des" }, { en: "Call the police", local: "警察を呼んでください" },
    { en: "Where is...?", local: "...はどこですか?" }, { en: "How much?", local: "いくらですか?", pron: "i-ku-ra des-ka" },
    { en: "I'm lost", local: "道に迷いました" }, { en: "I don't understand", local: "わかりません", pron: "wa-ka-ri-ma-sen" },
  ],
  ko: [
    { en: "Hello", local: "안녕하세요", pron: "an-nyong-ha-se-yo" }, { en: "Thank you", local: "감사합니다", pron: "kam-sa-ham-ni-da" },
    { en: "Yes / No", local: "네 / 아니요" }, { en: "Please", local: "부탁합니다" },
    { en: "Sorry / Excuse me", local: "죄송합니다" }, { en: "Help!", local: "도와주세요!", pron: "do-wa-ju-se-yo" },
    { en: "I need a doctor", local: "의사가 필요해요" }, { en: "Call the police", local: "경찰을 불러주세요" },
    { en: "Where is...?", local: "...어디에 있어요?" }, { en: "How much?", local: "얼마예요?", pron: "ol-ma-ye-yo" },
    { en: "I'm lost", local: "길을 잃었어요" }, { en: "I don't understand", local: "이해가 안 돼요" },
  ],
  zh: [
    { en: "Hello", local: "你好", pron: "nǐ hǎo" }, { en: "Thank you", local: "谢谢", pron: "xiè xie" },
    { en: "Yes / No", local: "是 / 不是" }, { en: "Please", local: "请", pron: "qǐng" },
    { en: "Sorry / Excuse me", local: "对不起 / 不好意思" }, { en: "Help!", local: "救命!", pron: "jiù mìng" },
    { en: "I need a doctor", local: "我需要医生" }, { en: "Call the police", local: "请叫警察" },
    { en: "Where is...?", local: "...在哪里?" }, { en: "How much?", local: "多少钱?", pron: "duō shǎo qián" },
    { en: "I'm lost", local: "我迷路了" }, { en: "I don't understand", local: "我不明白" },
  ],
  th: [
    { en: "Hello", local: "สวัสดี", pron: "sa-wat-dee" }, { en: "Thank you", local: "ขอบคุณ", pron: "khop-khun" },
    { en: "Yes / No", local: "ใช่ / ไม่" }, { en: "Please", local: "กรุณา" },
    { en: "Sorry / Excuse me", local: "ขอโทษ", pron: "khor-thot" }, { en: "Help!", local: "ช่วยด้วย!", pron: "chuay duay" },
    { en: "I need a doctor", local: "ต้องการหมอ" }, { en: "Call the police", local: "เรียกตำรวจ" },
    { en: "Where is...?", local: "...อยู่ที่ไหน?" }, { en: "How much?", local: "เท่าไหร่?", pron: "thao-rai" },
    { en: "I'm lost", local: "ฉันหลงทาง" }, { en: "I don't understand", local: "ไม่เข้าใจ" },
  ],
  vi: [
    { en: "Hello", local: "Xin chào", pron: "sin chow" }, { en: "Thank you", local: "Cảm ơn", pron: "kahm uhn" },
    { en: "Yes / No", local: "Vâng / Không" }, { en: "Please", local: "Làm ơn" },
    { en: "Sorry / Excuse me", local: "Xin lỗi" }, { en: "Help!", local: "Cứu!", pron: "kuu" },
    { en: "I need a doctor", local: "Tôi cần bác sĩ" }, { en: "Call the police", local: "Gọi cảnh sát" },
    { en: "Where is...?", local: "...ở đâu?" }, { en: "How much?", local: "Bao nhiêu?" },
    { en: "I'm lost", local: "Tôi bị lạc" }, { en: "I don't understand", local: "Tôi không hiểu" },
  ],
  id: [
    { en: "Hello", local: "Halo / Selamat" }, { en: "Thank you", local: "Terima kasih", pron: "te-ree-ma ka-see" },
    { en: "Yes / No", local: "Ya / Tidak" }, { en: "Please", local: "Tolong" },
    { en: "Sorry / Excuse me", local: "Maaf / Permisi" }, { en: "Help!", local: "Tolong!" },
    { en: "I need a doctor", local: "Saya butuh dokter" }, { en: "Call the police", local: "Panggil polisi" },
    { en: "Where is...?", local: "Di mana...?" }, { en: "How much?", local: "Berapa harganya?" },
    { en: "I'm lost", local: "Saya tersesat" }, { en: "I don't understand", local: "Saya tidak mengerti" },
  ],
  ms: [
    { en: "Hello", local: "Helo / Selamat" }, { en: "Thank you", local: "Terima kasih" },
    { en: "Yes / No", local: "Ya / Tidak" }, { en: "Please", local: "Tolong" },
    { en: "Sorry / Excuse me", local: "Maaf" }, { en: "Help!", local: "Tolong!" },
    { en: "I need a doctor", local: "Saya perlu doktor" }, { en: "Call the police", local: "Panggil polis" },
    { en: "Where is...?", local: "Di mana...?" }, { en: "How much?", local: "Berapa harganya?" },
    { en: "I'm lost", local: "Saya sesat" }, { en: "I don't understand", local: "Saya tidak faham" },
  ],
  hi: [
    { en: "Hello", local: "नमस्ते", pron: "na-mas-te" }, { en: "Thank you", local: "धन्यवाद", pron: "dhan-ya-vaad" },
    { en: "Yes / No", local: "हाँ / नहीं" }, { en: "Please", local: "कृपया" },
    { en: "Sorry / Excuse me", local: "माफ़ कीजिए" }, { en: "Help!", local: "मदद!", pron: "ma-dad" },
    { en: "I need a doctor", local: "मुझे डॉक्टर चाहिए" }, { en: "Call the police", local: "पुलिस को बुलाओ" },
    { en: "Where is...?", local: "...कहाँ है?" }, { en: "How much?", local: "कितना?" },
    { en: "I'm lost", local: "मैं रास्ता भूल गया" }, { en: "I don't understand", local: "मुझे समझ नहीं आया" },
  ],
  ar: [
    { en: "Hello", local: "مرحبا", pron: "mar-ha-ban" }, { en: "Thank you", local: "شكرا", pron: "shu-kran" },
    { en: "Yes / No", local: "نعم / لا" }, { en: "Please", local: "من فضلك" },
    { en: "Sorry / Excuse me", local: "آسف / لو سمحت" }, { en: "Help!", local: "النجدة!", pron: "an-naj-da" },
    { en: "I need a doctor", local: "أحتاج طبيب" }, { en: "Call the police", local: "اتصل بالشرطة" },
    { en: "Where is...?", local: "أين...؟" }, { en: "How much?", local: "بكم؟", pron: "bi-kam" },
    { en: "I'm lost", local: "أنا تائه" }, { en: "I don't understand", local: "لا أفهم" },
  ],
  tr: [
    { en: "Hello", local: "Merhaba" }, { en: "Thank you", local: "Teşekkürler" },
    { en: "Yes / No", local: "Evet / Hayır" }, { en: "Please", local: "Lütfen" },
    { en: "Sorry / Excuse me", local: "Pardon / Affedersiniz" }, { en: "Help!", local: "İmdat!", pron: "im-daht" },
    { en: "I need a doctor", local: "Doktora ihtiyacım var" }, { en: "Call the police", local: "Polisi arayın" },
    { en: "Where is...?", local: "...nerede?" }, { en: "How much?", local: "Ne kadar?" },
    { en: "I'm lost", local: "Kayboldum" }, { en: "I don't understand", local: "Anlamıyorum" },
  ],
  el: [
    { en: "Hello", local: "Γειά σας", pron: "yah-sas" }, { en: "Thank you", local: "Ευχαριστώ", pron: "ef-kha-ree-sto" },
    { en: "Yes / No", local: "Ναι / Όχι" }, { en: "Please", local: "Παρακαλώ" },
    { en: "Sorry / Excuse me", local: "Συγγνώμη" }, { en: "Help!", local: "Βοήθεια!", pron: "voh-ee-thya" },
    { en: "I need a doctor", local: "Χρειάζομαι γιατρό" }, { en: "Call the police", local: "Καλέστε την αστυνομία" },
    { en: "Where is...?", local: "Πού είναι...;" }, { en: "How much?", local: "Πόσο κάνει;" },
    { en: "I'm lost", local: "Έχω χαθεί" }, { en: "I don't understand", local: "Δεν καταλαβαίνω" },
  ],
  is: [
    { en: "Hello", local: "Halló / Sæl" }, { en: "Thank you", local: "Takk fyrir" },
    { en: "Yes / No", local: "Já / Nei" }, { en: "Please", local: "Vinsamlegast" },
    { en: "Sorry / Excuse me", local: "Afsakið" }, { en: "Help!", local: "Hjálp!" },
    { en: "I need a doctor", local: "Ég þarf lækni" }, { en: "Call the police", local: "Hringdu í lögregluna" },
    { en: "Where is...?", local: "Hvar er...?" }, { en: "How much?", local: "Hvað kostar?" },
    { en: "I'm lost", local: "Ég er týnd/ur" }, { en: "I don't understand", local: "Ég skil ekki" },
  ],
  sw: [
    { en: "Hello", local: "Jambo / Habari" }, { en: "Thank you", local: "Asante" },
    { en: "Yes / No", local: "Ndiyo / Hapana" }, { en: "Please", local: "Tafadhali" },
    { en: "Sorry / Excuse me", local: "Pole / Samahani" }, { en: "Help!", local: "Saidia!" },
    { en: "I need a doctor", local: "Nahitaji daktari" }, { en: "Call the police", local: "Mwite polisi" },
    { en: "Where is...?", local: "...iko wapi?" }, { en: "How much?", local: "Bei gani?" },
    { en: "I'm lost", local: "Nimepotea" }, { en: "I don't understand", local: "Sielewi" },
  ],
};

export const getPhrases = (lang?: string): Phrase[] => {
  if (!lang) return PHRASEBOOK.en;
  return PHRASEBOOK[lang.toLowerCase()] ?? PHRASEBOOK.en;
};
