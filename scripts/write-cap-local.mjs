import fs from 'node:fs';
import os from 'node:os';

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // IPv4, 내부망, loopback 제외
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

const ip = getLanIp();
if (!ip) {
  console.error('LAN IP를 찾지 못했습니다. (Wi-Fi 연결/네트워크 상태 확인)');
  process.exit(1);
}

const data = {
  server: {
    url: `http://${ip}:5173`,
    cleartext: true
  }
};

fs.writeFileSync(
  'capacitor.config.local.json',
  JSON.stringify(data, null, 2),
  'utf-8'
);

console.log(`✅ capacitor.config.local.json 업데이트 완료: ${data.server.url}`);