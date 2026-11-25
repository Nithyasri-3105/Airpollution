import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword, city, age, healthSensitivity } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password and confirm password do not match.' }, { status: 400 });
    }
    if (!city || !city.trim()) {
      return NextResponse.json({ error: 'City is required.' }, { status: 400 });
    }

    // Check duplicate
    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please login instead.' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const parsedAge = age ? parseInt(age, 10) : undefined;

    const user = createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      city: city.trim(),
      age: isNaN(parsedAge as number) ? undefined : parsedAge,
      healthSensitivity: healthSensitivity || 'None',
      alertPreferences: {
        unhealthyAlerts: true,
        predictionSpikeAlerts: true,
        activityAlerts: true,
        emailDigest: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please login to continue.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        healthSensitivity: user.healthSensitivity
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Internal server error processing registration.' }, { status: 500 });
  }
}
