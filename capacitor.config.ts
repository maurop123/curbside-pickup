import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'curbside-pickup',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
