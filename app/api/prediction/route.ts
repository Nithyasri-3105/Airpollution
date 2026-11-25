import { NextResponse } from 'next/server';
import { fetchLiveCityData } from '@/lib/live-aqi-service';
import { generateAQIPrediction } from '@/lib/prediction-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get('city') || 'delhi';
  const periodParam = (searchParams.get('period') || '24h') as '24h' | '3d' | '7d';

  const validPeriod = ['24h', '3d', '7d'].includes(periodParam) ? periodParam : '24h';

  const city = await fetchLiveCityData(cityParam);
  const prediction = generateAQIPrediction(city, validPeriod);

  return NextResponse.json({
    success: true,
    prediction,
    isLive: true
  });
}

