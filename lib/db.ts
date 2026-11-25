import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, SystemAlert } from './types';

interface DatabaseSchema {
  users: User[];
  alerts: SystemAlert[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialData(): DatabaseSchema {
  const defaultPasswordHash = bcrypt.hashSync('demo123', 10);
  return {
    users: [
      {
        id: 'usr-demo-1',
        name: 'Alex Mercer',
        email: 'alex@airsense.ai',
        passwordHash: defaultPasswordHash,
        city: 'Delhi',
        age: 29,
        healthSensitivity: 'Asthma',
        alertPreferences: {
          unhealthyAlerts: true,
          predictionSpikeAlerts: true,
          activityAlerts: true,
          emailDigest: false
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-demo-2',
        name: 'Sarah Chen',
        email: 'sarah@airsense.ai',
        passwordHash: defaultPasswordHash,
        city: 'New York',
        age: 34,
        healthSensitivity: 'None',
        alertPreferences: {
          unhealthyAlerts: true,
          predictionSpikeAlerts: false,
          activityAlerts: true,
          emailDigest: true
        },
        createdAt: new Date().toISOString()
      }
    ],
    alerts: [
      {
        id: 'alt-1',
        type: 'danger',
        title: 'Air Quality Alert: Unhealthy Level Detected',
        message: 'Current AQI in Delhi has reached 184 (Unhealthy). Sensitive groups should refrain from outdoor physical exertion.',
        timestamp: '15 mins ago',
        read: false,
        city: 'Delhi'
      },
      {
        id: 'alt-2',
        type: 'warning',
        title: 'Forecast Spike Alert: Evening Rush Hour',
        message: 'Particulate PM2.5 levels are forecasted to spike by 32% between 18:00 and 21:00 due to temperature inversion.',
        timestamp: '1 hour ago',
        read: false,
        city: 'Delhi'
      },
      {
        id: 'alt-3',
        type: 'info',
        title: 'Clean Air Window Advisory',
        message: 'Optimal green zone activity window in Lodhi Gardens detected between 06:00 AM and 07:30 AM tomorrow.',
        timestamp: '3 hours ago',
        read: true,
        city: 'Delhi'
      }
    ]
  };
}

export function readDatabase(): DatabaseSchema {
  try {
    ensureDataDir();
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading database, resetting to initial state:', error);
    const initial = getInitialData();
    try {
      ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {}
    return initial;
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database:', error);
    throw error;
  }
}

// User operations
export function findUserByEmail(email: string): User | undefined {
  const db = readDatabase();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const db = readDatabase();
  return db.users.find(u => u.id === id);
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const db = readDatabase();
  const newUser: User = {
    ...userData,
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDatabase(db);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDatabase();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;
  db.users[index] = { ...db.users[index], ...updates };
  writeDatabase(db);
  return db.users[index];
}

// Alerts operations
export function getAlertsForUser(city?: string): SystemAlert[] {
  const db = readDatabase();
  if (!city) return db.alerts;
  return db.alerts.filter(a => !a.city || a.city.toLowerCase() === city.toLowerCase());
}

export function markAlertAsRead(alertId: string): void {
  const db = readDatabase();
  const alert = db.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.read = true;
    writeDatabase(db);
  }
}
