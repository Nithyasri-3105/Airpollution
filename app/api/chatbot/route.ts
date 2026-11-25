import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processChatbotQuery } from '@/lib/chatbot-engine';
import { fetchLiveCityData } from '@/lib/live-aqi-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, cityId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const user = await getCurrentUser();
    const queryCity = cityId || user?.city || 'delhi';
    const city = await fetchLiveCityData(queryCity);

    // Check if Gemini API key is available
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim()) {
      try {
        const systemPrompt = `You are AirSense AI, an expert environmental and health advisory assistant.
City Context:
- City: ${city.name} (${city.stateCountry})
- Current AQI: ${city.currentAQI} (${city.category})
- Dominant Pollutant: ${city.dominantPollutant.toUpperCase()} (${city.pollutants[city.dominantPollutant]} µg/m³)
- Pollutant Breakdown: PM2.5: ${city.pollutants.pm25} µg/m³, PM10: ${city.pollutants.pm10} µg/m³, NO2: ${city.pollutants.no2} µg/m³, O3: ${city.pollutants.o3} µg/m³, CO: ${city.pollutants.co} ppm, SO2: ${city.pollutants.so2} µg/m³
- Weather: ${city.weather.temperature}°C, ${city.weather.humidity}% Humidity, Wind ${city.weather.windSpeed} km/h (${city.weather.windDirection})
- User Profile: ${user ? `${user.name}, Age ${user.age || 'N/A'}, Health Condition: ${user.healthSensitivity}` : 'Guest User'}

User Question: "${message}"

Respond directly, concisely, and professionally using clear markdown headers and bullet points. Focus on accurate environmental health advice based strictly on the provided real-time AQI telemetry.`;

        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          }
        );

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const aiText = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            return NextResponse.json({
              success: true,
              answer: aiText,
              suggestedFollowUps: [
                'Will air quality get worse tomorrow?',
                'Is it safe to go jogging today?',
                'What precautions should I take?'
              ],
              city: city.name,
              isLive: true,
              provider: 'Gemini AI'
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using built-in rule engine:', geminiError);
      }
    }

    const response = processChatbotQuery(message, city, user);

    return NextResponse.json({
      success: true,
      answer: response.answer,
      suggestedFollowUps: response.suggestedFollowUps,
      city: city.name,
      isLive: true
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json({
      success: false,
      answer: "I'm having trouble analyzing live telemetry right now. Please verify your connection and try again.",
      suggestedFollowUps: ['What is my current AQI?', 'When is the safest time to go outside?']
    }, { status: 500 });
  }
}

