import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.primeconnect.app',
  appName: 'PrimeConnect',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
