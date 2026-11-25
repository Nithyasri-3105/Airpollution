import { NextResponse } from 'next/server';
import { fetchLiveCitiesData } from '@/lib/live-aqi-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get('refresh') === 'true';
  const fullCities = await fetchLiveCitiesData(undefined, refresh);

  const cities = fullCities.map(c => ({
    id: c.id,
    name: c.name,
    stateCountry: c.stateCountry,
    lat: c.lat,
    lng: c.lng,
    currentAQI: c.currentAQI,
    category: c.category,
    dominantPollutant: c.dominantPollutant,
    weather: c.weather,
    pollutants: c.pollutants,
    lastUpdated: c.lastUpdated
  }));

  return NextResponse.json({ success: true, cities, isLive: true });
}
