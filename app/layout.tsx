import type { Metadata } from 'next';
import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'AIRSense AI – AI-Powered Air Quality Prediction & Environmental Advisory',
  description: 'Intelligent air-quality monitoring, predictive forecasts, multi-pollutant fingerprinting, and personalized health advisory platform.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-gray-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
