import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAlertsForUser } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const alerts = getAlertsForUser(user.city);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        age: user.age,
        healthSensitivity: user.healthSensitivity,
        alertPreferences: user.alertPreferences
      },
      alerts
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: 'Failed to verify session' }, { status: 500 });
  }
}
