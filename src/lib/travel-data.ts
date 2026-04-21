// Geocoding via Nominatim (OpenStreetMap) and Open-Meteo weather — both free, no key
export type GeoResult = {
  lat: number;
  lon: number;
  displayName: string;
  countryCode?: string;
  country?: string;
  city?: string;
};

export async function geocode(query: string): Promise<GeoResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.length) return null;
  const r = data[0];
  return {
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    displayName: r.display_name,
    countryCode: r.address?.country_code?.toUpperCase(),
    country: r.address?.country,
    city: r.address?.city || r.address?.town || r.address?.village || r.address?.state,
  };
}

export type WeatherSnapshot = {
  temp: number;
  apparent: number;
  condition: string;
  windKph: number;
  humidity: number;
  code: number;
};

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Heavy showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Severe thunderstorm",
};

export async function getWeather(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const d = await res.json();
  const c = d.current;
  return {
    temp: Math.round(c.temperature_2m),
    apparent: Math.round(c.apparent_temperature),
    condition: WEATHER_CODES[c.weather_code] || "—",
    windKph: Math.round(c.wind_speed_10m),
    humidity: c.relative_humidity_2m,
    code: c.weather_code,
  };
}

// Overpass API — nearby help points
export type Poi = {
  id: number;
  type: "hospital" | "police" | "pharmacy" | "embassy";
  name: string;
  lat: number;
  lon: number;
};

export async function getNearbyPois(lat: number, lon: number, radiusM = 3000): Promise<Poi[]> {
  const q = `[out:json][timeout:20];
(
  node["amenity"="hospital"](around:${radiusM},${lat},${lon});
  node["amenity"="police"](around:${radiusM},${lat},${lon});
  node["amenity"="pharmacy"](around:${radiusM},${lat},${lon});
  node["amenity"="embassy"](around:${radiusM},${lat},${lon});
);
out body 60;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: q,
  });
  if (!res.ok) return [];
  const d = await res.json();
  return (d.elements || []).map((el: any) => ({
    id: el.id,
    type: el.tags?.amenity as Poi["type"],
    name: el.tags?.name || `Unnamed ${el.tags?.amenity}`,
    lat: el.lat,
    lon: el.lon,
  }));
}
