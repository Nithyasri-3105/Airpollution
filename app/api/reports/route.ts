import { NextResponse } from 'next/server';
import { CITIES_DATA, getAQICategory } from '@/lib/aqi-data';

interface HistoricalRecord {
  id: string;
  city: string;
  date: string;
  time: string;
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  so2: number;
  temp: number;
  humidity: number;
  windSpeed: number;
}

// Generate realistic historical dataset for past 30 days
function generateHistoricalRecords(cityName: string, baseAQI: number, daysCount: number = 30): HistoricalRecord[] {
  const records: HistoricalRecord[] = [];
  const now = new Date();

  for (let i = 0; i < daysCount; i++) {
    const recordDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = recordDate.toISOString().split('T')[0];
    
    // Simulate realistic environmental shifts
    const cycle = Math.sin(i * 0.45) * 22;
    const aqi = Math.max(16, Math.round(baseAQI + cycle + ((i % 5) * 4 - 8)));
    const pm25 = Math.round(aqi * 0.62);
    const pm10 = Math.round(aqi * 1.15);
    const no2 = Math.round(25 + Math.cos(i * 0.3) * 18);
    const o3 = Math.round(30 + Math.sin(i * 0.2) * 20);
    const co = Number((0.4 + (aqi / 150) * 0.8).toFixed(1));
    const so2 = Math.round(5 + (aqi / 40) * 2.5);

    records.push({
      id: `rec-${cityName}-${dateStr}`,
      city: cityName,
      date: dateStr,
      time: '12:00 UTC',
      aqi,
      category: getAQICategory(aqi),
      pm25,
      pm10,
      no2,
      o3,
      co,
      so2,
      temp: 24 + Math.round(Math.sin(i) * 5),
      humidity: 55 + Math.round(Math.cos(i) * 15),
      windSpeed: 12 + Math.round(Math.sin(i * 2) * 6)
    });
  }

  return records;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get('city') || 'All';
  const rangeParam = searchParams.get('range') || '30'; // days
  const format = searchParams.get('format'); // 'csv' or json
  const minAQI = parseInt(searchParams.get('minAQI') || '0', 10);

  const days = parseInt(rangeParam, 10) || 30;
  let allRecords: HistoricalRecord[] = [];

  if (cityParam === 'All') {
    CITIES_DATA.slice(0, 6).forEach(c => {
      allRecords.push(...generateHistoricalRecords(c.name, c.currentAQI, Math.min(days, 15)));
    });
  } else {
    const city = CITIES_DATA.find(
      c => c.id.toLowerCase() === cityParam.toLowerCase() ||
           c.name.toLowerCase() === cityParam.toLowerCase()
    ) || CITIES_DATA[0];
    allRecords = generateHistoricalRecords(city.name, city.currentAQI, days);
  }

  // Filter
  if (minAQI > 0) {
    allRecords = allRecords.filter(r => r.aqi >= minAQI);
  }

  // Sort by date descending
  allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (format === 'csv') {
    const headers = [
      'Record ID', 'City', 'Date', 'Time', 'AQI', 'Category', 
      'PM2.5 (ug/m3)', 'PM10 (ug/m3)', 'NO2 (ppb)', 'O3 (ppb)', 
      'CO (ppm)', 'SO2 (ppb)', 'Temperature (C)', 'Humidity (%)', 'Wind Speed (km/h)'
    ];

    const rows = allRecords.map(r => [
      r.id,
      `"${r.city}"`,
      r.date,
      r.time,
      r.aqi,
      `"${r.category}"`,
      r.pm25,
      r.pm10,
      r.no2,
      r.o3,
      r.co,
      r.so2,
      r.temp,
      r.humidity,
      r.windSpeed
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="airsense-data-${cityParam.toLowerCase()}-${days}d.csv"`
      }
    });
  }

  return NextResponse.json({
    success: true,
    totalCount: allRecords.length,
    city: cityParam,
    days,
    records: allRecords
  });
}
