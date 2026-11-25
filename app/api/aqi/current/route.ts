import { NextResponse } from 'next/server';
import { fetchLiveCityData } from '@/lib/live-aqi-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get('city') || 'delhi';
  const refresh = searchParams.get('refresh') === 'true';

  const city = await fetchLiveCityData(cityParam, refresh);

  return NextResponse.json(
    { success: true, city, isLive: true },
    {
      headers: {
        'Cache-Control': refresh ? 'no-cache, no-store' : 's-maxage=60, stale-while-revalidate=30',
      },
    }
  );
}
