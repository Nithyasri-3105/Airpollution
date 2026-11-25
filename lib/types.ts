export type AQICategory = 
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export type HealthSensitivity = 
  | 'None'
  | 'Asthma'
  | 'Respiratory sensitivity'
  | 'Heart condition'
  | 'Allergy sensitivity'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  city: string;
  age?: number;
  healthSensitivity: HealthSensitivity;
  alertPreferences: {
    unhealthyAlerts: boolean;
    predictionSpikeAlerts: boolean;
    activityAlerts: boolean;
    emailDigest: boolean;
  };
  createdAt: string;
}

export interface PollutantValues {
  pm25: number;   // µg/m³
  pm10: number;   // µg/m³
  no2: number;    // ppb or µg/m³
  o3: number;     // ppb or µg/m³
  co: number;     // ppm
  so2: number;    // ppb
}

export interface WeatherData {
  temperature: number; // °C
  humidity: number;    // %
  windSpeed: number;   // km/h
  windDirection: string;
  pressure: number;    // hPa
  uvIndex: number;
}

export interface CityData {
  id: string;
  name: string;
  stateCountry: string;
  lat: number;
  lng: number;
  currentAQI: number;
  category: AQICategory;
  dominantPollutant: keyof PollutantValues;
  pollutants: PollutantValues;
  weather: WeatherData;
  lastUpdated: string;
}

export interface HourlyForecast {
  time: string; // e.g. "14:00" or ISO
  aqi: number;
  category: AQICategory;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  temp: number;
}

export interface DailyForecast {
  date: string; // e.g. "2026-09-24"
  dayName: string; // "Tomorrow", "Thursday", etc.
  aqi: number;
  minAQI: number;
  maxAQI: number;
  category: AQICategory;
  dominantPollutant: string;
  pm25: number;
  weatherSummary: string;
  explanation: string;
}

export interface PredictionResult {
  cityId: string;
  cityName: string;
  period: '24h' | '3d' | '7d';
  currentAQI: number;
  predictedAQI: number;
  category: AQICategory;
  expectedPeakTime: string;
  expectedPeakAQI: number;
  expectedCleanestTime: string;
  expectedCleanestAQI: number;
  naturalLanguageInsight: string;
  pollutantTrends: {
    labels: string[];
    pm25: number[];
    pm10: number[];
    no2: number[];
    o3: number[];
  };
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
}

export interface HealthAdvisoryResult {
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Severe';
  generalAdvice: string;
  outdoorActivities: {
    status: 'Safe' | 'Caution' | 'Avoid';
    details: string;
  };
  maskAdvice: {
    recommended: boolean;
    maskType: string;
    details: string;
  };
  ventilationAdvice: {
    status: 'Open Windows' | 'Limited Ventilation' | 'Keep Windows Closed';
    details: string;
  };
  sensitiveGroupAdvice: {
    condition: HealthSensitivity;
    details: string;
  };
  activitiesToAvoid: string[];
  recommendedActions: string[];
  disclaimer: string;
}

export interface PollutionSource {
  source: string;
  percentage: number;
  confidence: 'High' | 'Medium' | 'Calculated';
  relatedPollutants: string[];
  description: string;
  color: string;
}

export interface GreenZone {
  id: string;
  name: string;
  city: string;
  distanceKm: number;
  currentAQI: number;
  expectedAQI: number;
  category: AQICategory;
  bestTimeWindow: string;
  suitableActivities: string[];
  reason: string;
  vegetationIndex: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  city?: string;
}
