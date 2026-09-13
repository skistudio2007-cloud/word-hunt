import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wordhunt.puzzle',
  appName: 'Word Hunt',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
