import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.primeconnect.app',
  appName: 'PrimeConnect',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
