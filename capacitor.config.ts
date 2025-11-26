import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.origo.app',
  appName: 'Origo',
  webDir: 'out',
  server: {
    url: 'https://origo-1629f.web.app/',
    cleartext: true
  }
};

export default config;
