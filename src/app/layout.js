import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a1a',
};

export const metadata = {
  title: 'Origo Inmobiliaria',
  description: 'Propiedades exclusivas en el Oriente Antioqueño',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Origo',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthContextProvider>
          {children}
          <BottomNav />
        </AuthContextProvider>
      </body>
    </html>
  );
}
