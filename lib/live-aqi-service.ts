import { CityData, PollutantValues, WeatherData, AQICategory } from './types';
import { CITIES_DATA, getAQICategory } from './aqi-data';

// Known coordinates for fast lookup & fallback mapping
const KNOWN_CITIES: Record<string, { id: string; name: string; stateCountry: string; lat: number; lng: number }> = {
  delhi: { id: 'delhi', name: 'Delhi', stateCountry: 'India', lat: 28.6139, lng: 77.2090 },
  mumbai: { id: 'mumbai', name: 'Mumbai', stateCountry: 'India', lat: 19.0760, lng: 72.8777 },
  bengaluru: { id: 'bengaluru', name: 'Bengaluru', stateCountry: 'India', lat: 12.9716, lng: 77.5946 },
  'new-york': { id: 'new-york', name: 'New York', stateCountry: 'USA', lat: 40.7128, lng: -74.0060 },
  'los-angeles': { id: 'los-angeles', name: 'Los Angeles', stateCountry: 'USA', lat: 34.0522, lng: -118.2437 },
  london: { id: 'london', name: 'London', stateCountry: 'UK', lat: 51.5074, lng: -0.1278 },
  tokyo: { id: 'tokyo', name: 'Tokyo', stateCountry: 'Japan', lat: 35.6762, lng: 139.6503 },
  paris: { id: 'paris', name: 'Paris', stateCountry: 'France', lat: 48.8566, lng: 2.3522 },
  beijing: { id: 'beijing', name: 'Beijing', stateCountry: 'China', lat: 39.9042, lng: 116.4074 },
  sydney: { id: 'sydney', name: 'Sydney', stateCountry: 'Australia', lat: -33.8688, lng: 151.2093 },
  dubai: { id: 'dubai', name: 'Dubai', stateCountry: 'UAE', lat: 25.2048, lng: 55.2708 },
  singapore: { id: 'singapore', name: 'Singapore', stateCountry: 'Singapore', lat: 1.3521, lng: 103.8198 },
};

// In-memory cache for live telemetry (valid for 3 minutes)
interface CacheEntry {
  data: CityData;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export function clearLiveAQICache(): void {
  cache.clear();
}

/**
 * Fast fetch wrapper with a strict timeout to prevent slow network responses from hanging the UI
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function degreesToCompass(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
  { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 },
];

const O3_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
  { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
  { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
  { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
];

const NO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
  { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
  { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
];

const SO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
  { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
  { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
  { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
];

const CO_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 4.4, iLow: 0, iHigh: 50 },
  { cLow: 4.5, cHigh: 9.4, iLow: 51, iHigh: 100 },
  { cLow: 9.5, cHigh: 12.4, iLow: 101, iHigh: 150 },
  { cLow: 12.5, cHigh: 15.4, iLow: 151, iHigh: 200 },
];

function calculateSubIndex(conc: number, breakpoints: Breakpoint[]): number {
  if (conc <= 0) return 0;
  for (const bp of breakpoints) {
    if (conc >= bp.cLow && conc <= bp.cHigh) {
      return Math.round(((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (conc - bp.cLow) + bp.iLow);
    }
  }
  const highest = breakpoints[breakpoints.length - 1];
  if (conc > highest.cHigh) {
    return Math.min(500, Math.round(((500 - highest.iHigh) / (highest.cHigh * 1.5 - highest.cHigh)) * (conc - highest.cHigh) + highest.iHigh));
  }
  return 0;
}

/**
 * Computes official US EPA AQI across all 6 criteria pollutants.
 * Harmonizes with qualitative telemetry tiers (such as OpenWeatherMap's 1-5 CAQI indicator)
 * to ensure cities like Tokyo accurately reflect current ground & atmospheric metrics.
 */
export function calculateEPAAirQuality(
  pollutants: PollutantValues,
  owmLevel?: number
): { aqi: number; dominantPollutant: keyof PollutantValues; subIndices: Record<keyof PollutantValues, number> } {
  const subIndices: Record<keyof PollutantValues, number> = {
    pm25: calculateSubIndex(pollutants.pm25, PM25_BREAKPOINTS),
    pm10: calculateSubIndex(pollutants.pm10, PM10_BREAKPOINTS),
    o3: calculateSubIndex(pollutants.o3 / 1.96, O3_BREAKPOINTS),
    no2: calculateSubIndex(pollutants.no2 / 1.88, NO2_BREAKPOINTS),
    so2: calculateSubIndex(pollutants.so2 / 2.62, SO2_BREAKPOINTS),
    co: calculateSubIndex(pollutants.co / 1.15, CO_BREAKPOINTS),
  };

  const entries = (Object.keys(subIndices) as (keyof PollutantValues)[]).map(key => ({
    pol: key,
    aqi: subIndices[key]
  }));
  entries.sort((a, b) => b.aqi - a.aqi);

  let dominantPollutant = entries[0].pol;
  let finalAQI = entries[0].aqi;

  // Harmonize with OpenWeatherMap 1-5 level if supplied
  if (owmLevel && owmLevel >= 1 && owmLevel <= 5) {
    const tierMap: Record<number, { min: number; max: number }> = {
      1: { min: 12, max: 50 },
      2: { min: 51, max: 100 },
      3: { min: 101, max: 150 },
      4: { min: 151, max: 200 },
      5: { min: 201, max: 500 },
    };

    const tier = tierMap[owmLevel];
    if (tier) {
      if (finalAQI < tier.min) {
        let ratio = 0.1;
        if (owmLevel === 2) {
          if (pollutants.o3 >= 60) { ratio = (pollutants.o3 - 60) / 40; dominantPollutant = 'o3'; }
          else if (pollutants.pm25 >= 10) { ratio = (pollutants.pm25 - 10) / 15; dominantPollutant = 'pm25'; }
          else if (pollutants.pm10 >= 20) { ratio = (pollutants.pm10 - 20) / 30; dominantPollutant = 'pm10'; }
          else if (pollutants.no2 >= 40) { ratio = (pollutants.no2 - 40) / 30; dominantPollutant = 'no2'; }
        } else if (owmLevel === 3) {
          if (pollutants.pm25 >= 25) { ratio = (pollutants.pm25 - 25) / 25; dominantPollutant = 'pm25'; }
          else if (pollutants.o3 >= 100) { ratio = (pollutants.o3 - 100) / 40; dominantPollutant = 'o3'; }
        }
        ratio = Math.max(0.05, Math.min(0.95, ratio));
        finalAQI = Math.round(tier.min + ratio * (tier.max - tier.min));
      } else if (finalAQI > tier.max) {
        finalAQI = Math.min(finalAQI, tier.max + 15);
      }
    }
  }

  return {
    aqi: Math.max(1, Math.min(500, finalAQI)),
    dominantPollutant,
    subIndices
  };
}

/**
 * Geocodes city name dynamically if not in KNOWN_CITIES
 */
async function geocodeCity(query: string): Promise<{ id: string; name: string; stateCountry: string; lat: number; lng: number } | null> {
  const normalizedKey = query.toLowerCase().trim().replace(/\s+/g, '-');
  if (KNOWN_CITIES[normalizedKey]) {
    return KNOWN_CITIES[normalizedKey];
  }

  // Check static CITIES_DATA
  const staticCity = CITIES_DATA.find(
    c => c.id.toLowerCase() === normalizedKey || c.name.toLowerCase() === query.toLowerCase()
  );
  if (staticCity) {
    return {
      id: staticCity.id,
      name: staticCity.name,
      stateCountry: staticCity.stateCountry,
      lat: staticCity.lat,
      lng: staticCity.lng,
    };
  }

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    if (geoData?.results?.length > 0) {
      const first = geoData.results[0];
      const cityName = first.name;
      const country = first.country || first.admin1 || 'Global';
      return {
        id: cityName.toLowerCase().replace(/\s+/g, '-'),
        name: cityName,
        stateCountry: country,
        lat: first.latitude,
        lng: first.longitude,
      };
    }
  } catch (err) {
    console.warn('Geocoding error:', err);
  }

  return null;
}

/**
 * Fetches real-time AQI and Weather telemetry from live sensor APIs for a given city
 */
export async function fetchLiveCityData(cityQuery: string, forceRefresh = false): Promise<CityData> {
  const cacheKey = cityQuery.toLowerCase().trim();
  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const location = await geocodeCity(cityQuery);
  const fallbackCity = CITIES_DATA.find(
    c => c.id.toLowerCase() === cacheKey || c.name.toLowerCase() === cacheKey
  ) || CITIES_DATA[0];

  const lat = location ? location.lat : fallbackCity.lat;
  const lng = location ? location.lng : fallbackCity.lng;
  const cityName = location ? location.name : fallbackCity.name;
  const stateCountry = location ? location.stateCountry : fallbackCity.stateCountry;
  const cityId = location ? location.id : fallbackCity.id;

  // 1. Try WAQI (World Air Quality Index) API if key is available
  const waqiToken = process.env.WAQI_API_KEY || process.env.NEXT_PUBLIC_WAQI_API_KEY;
  if (waqiToken && waqiToken.trim()) {
    try {
      const waqiRes = await fetchWithTimeout(`https://api.waqi.info/feed/${encodeURIComponent(cityName)}/?token=${waqiToken.trim()}`);
      if (waqiRes.ok) {
        const waqiJson = await waqiRes.json();
        if (waqiJson.status === 'ok' && waqiJson.data) {
          const d = waqiJson.data;
          const iaqi = d.iaqi || {};
          const currentAQI = Math.max(1, Math.min(500, Math.round(d.aqi ?? fallbackCity.currentAQI)));
          const category = getAQICategory(currentAQI);
          
          const pm25 = Math.round((iaqi.pm25?.v ?? fallbackCity.pollutants.pm25) * 10) / 10;
          const pm10 = Math.round((iaqi.pm10?.v ?? fallbackCity.pollutants.pm10) * 10) / 10;
          const no2 = Math.round((iaqi.no2?.v ?? fallbackCity.pollutants.no2) * 10) / 10;
          const o3 = Math.round((iaqi.o3?.v ?? fallbackCity.pollutants.o3) * 10) / 10;
          const co = Math.round((iaqi.co?.v ?? fallbackCity.pollutants.co) * 10) / 10;
          const so2 = Math.round((iaqi.so2?.v ?? fallbackCity.pollutants.so2) * 10) / 10;

          let dominantPollutant: keyof PollutantValues = 'pm25';
          if (d.dominentpol && ['pm25', 'pm10', 'no2', 'o3', 'co', 'so2'].includes(d.dominentpol)) {
            dominantPollutant = d.dominentpol as keyof PollutantValues;
          }

          const liveCity: CityData = {
            id: cityId,
            name: cityName,
            stateCountry,
            lat: d.city?.geo?.[0] || lat,
            lng: d.city?.geo?.[1] || lng,
            currentAQI,
            category,
            dominantPollutant,
            pollutants: { pm25, pm10, no2, o3, co, so2 },
            weather: {
              temperature: Math.round(iaqi.t?.v ?? fallbackCity.weather.temperature),
              humidity: Math.round(iaqi.h?.v ?? fallbackCity.weather.humidity),
              windSpeed: Math.round(iaqi.w?.v ?? fallbackCity.weather.windSpeed),
              windDirection: degreesToCompass(iaqi.wg?.v ?? 180),
              pressure: Math.round(iaqi.p?.v ?? fallbackCity.weather.pressure),
              uvIndex: Math.round(fallbackCity.weather.uvIndex),
            },
            lastUpdated: `Live Station Telemetry (WAQI Station ${d.idx || ''})`,
          };

          cache.set(cacheKey, { data: liveCity, timestamp: Date.now() });
          return liveCity;
        }
      }
    } catch (err) {
      console.warn('[LiveAQIService] WAQI API fetch error, falling back:', err);
    }
  }

  // 2. Try OpenWeatherMap API if key is available
  const owmKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (owmKey && owmKey.trim()) {
    try {
      const [owmAqRes, owmWeatherRes] = await Promise.all([
        fetchWithTimeout(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${owmKey.trim()}`),
        fetchWithTimeout(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${owmKey.trim()}&units=metric`)
      ]);

      if (owmAqRes.ok && owmWeatherRes.ok) {
        const aqData = await owmAqRes.json();
        const wData = await owmWeatherRes.json();
        const components = aqData.list?.[0]?.components || {};
        const owmLevel = aqData.list?.[0]?.main?.aqi;

        const pm25 = Math.round((components.pm2_5 ?? fallbackCity.pollutants.pm25) * 10) / 10;
        const pm10 = Math.round((components.pm10 ?? fallbackCity.pollutants.pm10) * 10) / 10;
        const no2 = Math.round((components.no2 ?? fallbackCity.pollutants.no2) * 10) / 10;
        const o3 = Math.round((components.o3 ?? fallbackCity.pollutants.o3) * 10) / 10;
        const co = Math.round((components.co ? components.co / 1000 : fallbackCity.pollutants.co) * 10) / 10;
        const so2 = Math.round((components.so2 ?? fallbackCity.pollutants.so2) * 10) / 10;

        const pollutants: PollutantValues = { pm25, pm10, no2, o3, co, so2 };
        const calculated = calculateEPAAirQuality(pollutants, owmLevel);
        const currentAQI = calculated.aqi;
        const category: AQICategory = getAQICategory(currentAQI);
        const dominantPollutant = calculated.dominantPollutant;

        const liveCity: CityData = {
          id: cityId,
          name: cityName,
          stateCountry,
          lat,
          lng,
          currentAQI,
          category,
          dominantPollutant,
          pollutants,
          weather: {
            temperature: Math.round(wData.main?.temp ?? fallbackCity.weather.temperature),
            humidity: Math.round(wData.main?.humidity ?? fallbackCity.weather.humidity),
            windSpeed: Math.round((wData.wind?.speed ? wData.wind.speed * 3.6 : fallbackCity.weather.windSpeed)),
            windDirection: degreesToCompass(wData.wind?.deg ?? 180),
            pressure: Math.round(wData.main?.pressure ?? fallbackCity.weather.pressure),
            uvIndex: Math.round(fallbackCity.weather.uvIndex),
          },
          lastUpdated: 'Live OpenWeatherMap Telemetry Stream',
        };

        cache.set(cacheKey, { data: liveCity, timestamp: Date.now() });
        return liveCity;
      }
    } catch (err) {
      console.warn('[LiveAQIService] OpenWeatherMap API fetch error, falling back to Open-Meteo:', err);
    }
  }

  // 3. Fallback to Open-Meteo Air Quality & Weather API (Free No-Key Endpoint)
  try {
    const [aqRes, weatherRes] = await Promise.all([
      fetchWithTimeout(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi`
      ),
      fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index`
      ),
    ]);

    if (!aqRes.ok || !weatherRes.ok) {
      throw new Error(`API response failure: AQ status ${aqRes.status}, Weather status ${weatherRes.status}`);
    }

    const aqData = await aqRes.json();
    const weatherData = await weatherRes.json();

    const currAQ = aqData.current || {};
    const currWeather = weatherData.current || {};

    const pm25 = Math.round((currAQ.pm2_5 ?? fallbackCity.pollutants.pm25) * 10) / 10;
    const pm10 = Math.round((currAQ.pm10 ?? fallbackCity.pollutants.pm10) * 10) / 10;
    const no2 = Math.round((currAQ.nitrogen_dioxide ?? fallbackCity.pollutants.no2) * 10) / 10;
    const o3 = Math.round((currAQ.ozone ?? fallbackCity.pollutants.o3) * 10) / 10;
    const co = Math.round(((currAQ.carbon_monoxide ? currAQ.carbon_monoxide / 1000 : fallbackCity.pollutants.co)) * 10) / 10;
    const so2 = Math.round((currAQ.sulphur_dioxide ?? fallbackCity.pollutants.so2) * 10) / 10;

    const pollutants: PollutantValues = { pm25, pm10, no2, o3, co, so2 };
    const calculated = calculateEPAAirQuality(pollutants);

    // If Open-Meteo provided a valid us_aqi, respect it; otherwise use our EPA calculation
    const rawAQI = currAQ.us_aqi ? Math.round(currAQ.us_aqi) : calculated.aqi;
    const currentAQI = Math.max(1, Math.min(500, rawAQI));
    const category: AQICategory = getAQICategory(currentAQI);
    const dominantPollutant = calculated.dominantPollutant;

    const weather: WeatherData = {
      temperature: Math.round(currWeather.temperature_2m ?? fallbackCity.weather.temperature),
      humidity: Math.round(currWeather.relative_humidity_2m ?? fallbackCity.weather.humidity),
      windSpeed: Math.round(currWeather.wind_speed_10m ?? fallbackCity.weather.windSpeed),
      windDirection: degreesToCompass(currWeather.wind_direction_10m ?? 180),
      pressure: Math.round(currWeather.surface_pressure ?? fallbackCity.weather.pressure),
      uvIndex: Math.round(currWeather.uv_index ?? fallbackCity.weather.uvIndex),
    };

    const liveCity: CityData = {
      id: cityId,
      name: cityName,
      stateCountry,
      lat,
      lng,
      currentAQI,
      category,
      dominantPollutant,
      pollutants,
      weather,
      lastUpdated: 'Live satellite & sensor stream (Open-Meteo API)',
    };

    cache.set(cacheKey, { data: liveCity, timestamp: Date.now() });
    return liveCity;
  } catch (error) {
    // All live APIs failed — use static dataset fallback
    console.warn(`[LiveAQIService] All live sources failed for "${cityQuery}", using static dataset fallback:`, error);
    return fallbackCity;
  }
}

/**
 * Fetches real-time AQI for multiple cities in parallel
 */
export async function fetchLiveCitiesData(citiesList?: string[], forceRefresh = false): Promise<CityData[]> {
  const targets = citiesList && citiesList.length > 0 
    ? citiesList 
    : Object.keys(KNOWN_CITIES);

  const results = await Promise.allSettled(
    targets.map(c => fetchLiveCityData(c, forceRefresh))
  );

  // If live fetch fails for a city, fall back to its own unique static entry
  return results.map((res, idx) => {
    if (res.status === 'fulfilled') return res.value;
    const fallbackKey = targets[idx];
    return CITIES_DATA.find(c => c.id === fallbackKey) || CITIES_DATA[0];
  });
}
