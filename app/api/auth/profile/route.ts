import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUser } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, city, age, healthSensitivity, alertPreferences } = body;

    const updates: any = {};
    if (name && name.trim()) updates.name = name.trim();
    if (city && city.trim()) updates.city = city.trim();
    if (age !== undefined) {
      const parsedAge = parseInt(age, 10);
      updates.age = isNaN(parsedAge) ? undefined : parsedAge;
    }
    if (healthSensitivity) updates.healthSensitivity = healthSensitivity;
    if (alertPreferences) updates.alertPreferences = alertPreferences;

    const updated = updateUser(currentUser.id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        city: updated.city,
        age: updated.age,
        healthSensitivity: updated.healthSensitivity,
        alertPreferences: updated.alertPreferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
