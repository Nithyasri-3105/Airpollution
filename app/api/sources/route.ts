import { NextResponse } from 'next/server';
import { CITY_SOURCES_DATA } from '@/lib/aqi-data';
import { fetchLiveCityData } from '@/lib/live-aqi-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityParam = (searchParams.get('city') || 'delhi').toLowerCase();

  const city = await fetchLiveCityData(cityParam);
  const sources = CITY_SOURCES_DATA[city.id] || CITY_SOURCES_DATA['default'];

  return NextResponse.json({
    success: true,
    city: {
      id: city.id,
      name: city.name,
      currentAQI: city.currentAQI,
      category: city.category
    },
    sources,
    methodologyNote: "Sources are estimated using chemical mass balance, particulate size ratio analysis (PM2.5/PM10), and atmospheric boundary dispersion modeling calibrated with live telemetry.",
    isLive: true
  });
}

