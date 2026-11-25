import { NextResponse } from 'next/server';
import { fetchLiveCityData } from '@/lib/live-aqi-service';
import { generateAQIPrediction } from '@/lib/prediction-engine';
import { generateHealthAdvisory } from '@/lib/advisory-engine';
import { getCurrentUser } from '@/lib/auth';
import { HealthSensitivity } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get('city') || 'delhi';
  const customSensitivity = searchParams.get('sensitivity') as HealthSensitivity | null;
  const customAge = searchParams.get('age') ? parseInt(searchParams.get('age')!, 10) : undefined;

  const city = await fetchLiveCityData(cityParam);

  const user = await getCurrentUser();
  const prediction = generateAQIPrediction(city, '24h');

  const effectiveSensitivity: HealthSensitivity = 
    customSensitivity || user?.healthSensitivity || 'None';
  const effectiveAge = customAge !== undefined ? customAge : user?.age;

  const advisory = generateHealthAdvisory(
    city.currentAQI,
    prediction.predictedAQI,
    effectiveAge,
    effectiveSensitivity
  );

  return NextResponse.json({
    success: true,
    city: {
      id: city.id,
      name: city.name,
      currentAQI: city.currentAQI,
      category: city.category
    },
    userContext: {
      age: effectiveAge,
      healthSensitivity: effectiveSensitivity
    },
    advisory,
    isLive: true
  });
}

