import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wordhunt.puzzle',
  appName: 'Word Hunt',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-2007565791914092~7531337749'
    }
  }
};

export default config;
