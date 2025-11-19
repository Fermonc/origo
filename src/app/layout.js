import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Origo Inmobiliaria',
  description: 'Propiedades exclusivas en el Oriente Antioqueño',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
