import { CityData, HourlyForecast, DailyForecast, PredictionResult, AQICategory } from './types';
import { getAQICategory } from './aqi-data';

/**
 * Predicts AQI and pollutant trajectories for a given city and forecast horizon.
 * Designed with a pluggable architecture so it can be swapped with a real PyTorch / ONNX / LightGBM
 * microservice endpoint in production.
 */
export function generateAQIPrediction(city: CityData, period: '24h' | '3d' | '7d'): PredictionResult {
  const currentAQI = city.currentAQI;
  const currentPM25 = city.pollutants.pm25;
  const currentPM10 = city.pollutants.pm10;
  const currentNO2 = city.pollutants.no2;
  const currentO3 = city.pollutants.o3;

  if (period === '24h') {
    // Generate 24 hourly data points reflecting diurnal urban patterns:
    // Morning peak (08:00 - 10:00), Afternoon ozone spike (13:00 - 16:00), Evening rush & inversion peak (19:00 - 22:00)
    const hourly: HourlyForecast[] = [];
    const currentHour = new Date().getHours();
    
    let maxAQI = -1;
    let maxHour = '';
    let minAQI = 9999;
    let minHour = '';

    for (let i = 1; i <= 24; i++) {
      const forecastHour = (currentHour + i) % 24;
      const hourStr = `${forecastHour.toString().padStart(2, '0')}:00`;
      
      // Diurnal coefficient based on time
      let diurnalFactor = 1.0;
      if (forecastHour >= 7 && forecastHour <= 10) {
        diurnalFactor = 1.18; // Morning traffic
      } else if (forecastHour >= 12 && forecastHour <= 16) {
        diurnalFactor = 0.92; // Thermal mixing reduces ground PM, but increases O3
      } else if (forecastHour >= 18 && forecastHour <= 22) {
        diurnalFactor = 1.25; // Evening peak traffic & lowering boundary layer
      } else if (forecastHour >= 2 && forecastHour <= 5) {
        diurnalFactor = 0.85; // Low night traffic
      }

      // Add gentle oscillation
      const pseudoNoise = Math.sin(i * 0.7) * 4;
      const hourlyAQI = Math.max(15, Math.round(currentAQI * diurnalFactor + pseudoNoise));
      const cat = getAQICategory(hourlyAQI);

      if (hourlyAQI > maxAQI) {
        maxAQI = hourlyAQI;
        maxHour = hourStr;
      }
      if (hourlyAQI < minAQI) {
        minAQI = hourlyAQI;
        minHour = hourStr;
      }

      hourly.push({
        time: hourStr,
        aqi: hourlyAQI,
        category: cat,
        pm25: Math.round(currentPM25 * diurnalFactor + pseudoNoise * 0.6),
        pm10: Math.round(currentPM10 * diurnalFactor + pseudoNoise * 0.9),
        no2: Math.round(currentNO2 * (forecastHour >= 8 && forecastHour <= 20 ? 1.2 : 0.8)),
        o3: Math.round(currentO3 * (forecastHour >= 12 && forecastHour <= 17 ? 1.4 : 0.7)),
        temp: Math.round(city.weather.temperature + Math.sin((forecastHour - 8) * (Math.PI / 12)) * 6)
      });
    }

    const predictedAvgAQI = Math.round(hourly.reduce((sum, h) => sum + h.aqi, 0) / hourly.length);

    let insight = '';
    if (predictedAvgAQI > currentAQI + 15) {
      insight = `AQI in ${city.name} is forecasted to increase over the next 24 hours, peaking around ${maxHour} (AQI ${maxAQI}). Lower wind speeds (${city.weather.windSpeed} km/h) and a compressed nocturnal boundary layer are trapping particulate emissions from vehicular traffic.`;
    } else if (predictedAvgAQI < currentAQI - 15) {
      insight = `Air quality in ${city.name} is expected to improve notably over the next 24 hours, reaching a low of AQI ${minAQI} around ${minHour}. Increased atmospheric mixing and favorable wind ventilation are dispersing ground-level particulates.`;
    } else {
      insight = `AQI in ${city.name} will remain relatively stable around ${predictedAvgAQI} (${getAQICategory(predictedAvgAQI)}). Peak concentration is anticipated at ${maxHour} (${maxAQI}), while the cleanest window will be around ${minHour} (${minAQI}).`;
    }

    return {
      cityId: city.id,
      cityName: city.name,
      period: '24h',
      currentAQI,
      predictedAQI: predictedAvgAQI,
      category: getAQICategory(predictedAvgAQI),
      expectedPeakTime: maxHour,
      expectedPeakAQI: maxAQI,
      expectedCleanestTime: minHour,
      expectedCleanestAQI: minAQI,
      naturalLanguageInsight: insight,
      pollutantTrends: {
        labels: hourly.map(h => h.time),
        pm25: hourly.map(h => h.pm25),
        pm10: hourly.map(h => h.pm10),
        no2: hourly.map(h => h.no2),
        o3: hourly.map(h => h.o3),
      },
      hourly
    };
  }

  // Multi-day forecast (3d or 7d)
  const daysCount = period === '3d' ? 3 : 7;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daily: DailyForecast[] = [];
  const now = new Date();

  let maxAQI = -1;
  let maxDay = '';
  let minAQI = 9999;
  let minDay = '';

  for (let d = 1; d <= daysCount; d++) {
    const fDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const dayName = d === 1 ? 'Tomorrow' : dayNames[fDate.getDay()];
    const dateStr = fDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Weather simulation variations
    const isWeekend = fDate.getDay() === 0 || fDate.getDay() === 6;
    const trafficRelief = isWeekend ? -12 : 6;
    const weatherFactor = Math.sin(d * 1.3) * 15;
    
    const dayAQI = Math.max(18, Math.round(currentAQI + trafficRelief + weatherFactor));
    const dayMin = Math.round(dayAQI * 0.82);
    const dayMax = Math.round(dayAQI * 1.22);
    const dayCat = getAQICategory(dayAQI);

    if (dayAQI > maxAQI) {
      maxAQI = dayAQI;
      maxDay = `${dayName} (${dateStr})`;
    }
    if (dayAQI < minAQI) {
      minAQI = dayAQI;
      minDay = `${dayName} (${dateStr})`;
    }

    let weatherSummary = 'Partly Cloudy, Moderate Breeze';
    if (weatherFactor > 8) weatherSummary = 'Stagnant Calm, Thermal Inversion';
    if (weatherFactor < -8) weatherSummary = 'Breezy, Scavenging Winds';

    let dayExplanation = `Expected AQI ${dayAQI} (${dayCat}). `;
    if (isWeekend) {
      dayExplanation += 'Weekend freight restrictions and lower commuter volume contribute to localized particulate abatement.';
    } else if (weatherFactor > 0) {
      dayExplanation += 'Weak wind velocity leads to progressive pollutant accumulation along major transport sectors.';
    } else {
      dayExplanation += 'Strengthened boundary layer ventilation supports active atmospheric dispersion.';
    }

    daily.push({
      date: dateStr,
      dayName,
      aqi: dayAQI,
      minAQI: dayMin,
      maxAQI: dayMax,
      category: dayCat,
      dominantPollutant: city.dominantPollutant.toUpperCase(),
      pm25: Math.round(currentPM25 * (dayAQI / currentAQI)),
      weatherSummary,
      explanation: dayExplanation
    });
  }

  const overallAvg = Math.round(daily.reduce((acc, d) => acc + d.aqi, 0) / daily.length);

  const insight = `Over the next ${period === '3d' ? '3 days' : '7 days'} in ${city.name}, air quality will average around AQI ${overallAvg} (${getAQICategory(overallAvg)}). Highest pollution exposure is expected on ${maxDay} with peak indices near ${maxAQI}, while the most favorable outdoor air quality is projected on ${minDay} with AQI ${minAQI}.`;

  return {
    cityId: city.id,
    cityName: city.name,
    period,
    currentAQI,
    predictedAQI: overallAvg,
    category: getAQICategory(overallAvg),
    expectedPeakTime: maxDay,
    expectedPeakAQI: maxAQI,
    expectedCleanestTime: minDay,
    expectedCleanestAQI: minAQI,
    naturalLanguageInsight: insight,
    pollutantTrends: {
      labels: daily.map(d => `${d.dayName}`),
      pm25: daily.map(d => d.pm25),
      pm10: daily.map(d => Math.round(d.pm25 * 1.8)),
      no2: daily.map(d => Math.round(city.pollutants.no2 * (d.aqi / currentAQI))),
      o3: daily.map(d => Math.round(city.pollutants.o3 * 0.9 + Math.random() * 8)),
    },
    daily
  };
}
