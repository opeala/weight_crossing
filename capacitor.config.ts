import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weightcrossing.app',
  appName: 'Weight Crossing',
  webDir: 'dist',
  backgroundColor: '#9fe0e8',
  android: { backgroundColor: '#9fe0e8' },
  ios: { backgroundColor: '#9fe0e8', contentInset: 'never' },
};

export default config;
