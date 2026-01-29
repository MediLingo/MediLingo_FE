import type { CapacitorConfig } from '@capacitor/cli';
import fs from 'node:fs';

const baseConfig: CapacitorConfig = {
  appId: 'com.medilingo.app',
  appName: 'medilingo',
  webDir: 'dist',
};

// 로컬 전용 설정 파일이 있으면 그 설정으로 덮어쓰기
const localPath = 'capacitor.config.local.json';
let localConfig: Partial<CapacitorConfig> = {};

if (fs.existsSync(localPath)) {
  try {
    localConfig = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
  } catch (e) {
    console.warn(`[capacitor] Failed to parse ${localPath}:`, e);
  }
}

const config: CapacitorConfig = {
  ...baseConfig,
  ...localConfig,
  server: {
    ...(baseConfig.server ?? {}),
    ...(localConfig.server ?? {}),
  },
};

export default config;