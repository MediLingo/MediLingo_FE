## 목차
- [⭐️ 중요 ⭐️](#important)
- [📌 로컬에서 실행하기](#local-web)
- [📌 macOS에서 iOS 시뮬레이터 앱 실행하기 (Capacitor)](#ios-sim)
- [📌 Windows에서 Android 에뮬레이터 앱 실행하기 (Capacitor)](#android-emu)

<a id="important"></a>
## ⭐️ 중요 ⭐️

실제 iPhone/Android **실기기에서 dev 서버로 접속하려면 반드시 PC/Mac과 같은 Wi‑Fi에 연결**되어 있어야 합니다.
- 실기기에서 `localhost`는 **휴대폰 자신**을 의미하므로, PC/Mac의 Vite 서버에 접속하려면 **LAN IP**가 필요합니다.
- 이 프로젝트는 그 LAN IP를 **자동으로 찾아** 로컬 설정 파일에 반영합니다.

### 매번 개발 시작시 해야할 일

1) 의존성 설치(최초 1회)
```bash
npm install
```

2) (중요) 로컬 IP 자동 설정 파일 생성/갱신
```bash
npm run cap:local
```
- 위 명령은 `capacitor.config.local.json`을 생성/갱신합니다. (**개인별 파일, git ignore**)

3) Vite dev 서버 실행 (이미 네트워크 호스트 옵션이 포함되어 있음)
```bash
npm run dev
```

4) 플랫폼 동기화 후 실행
- iOS:
```bash
npx cap sync ios
npx cap open ios
```
- Android:
```bash
npx cap sync android
npx cap open android
```

### 파일 관리 규칙
- `capacitor.config.ts` : 공용 설정(커밋 O)
- `capacitor.config.local.json` : 개인별 dev server URL(커밋 X)

<a id="local-web"></a>
## 📌 로컬에서 실행하기 (웹)

### 1) 의존성 설치
```bash
npm install
```

### 2) 환경변수 설정
`.env.local` 파일을 만들어 LLM API 키를 넣어주세요.
```bash
ex)
GEMINI_API_KEY=YOUR_KEY_HERE
```

### 3) 개발 서버 실행
```bash
npm run dev
```

---

<a id="ios-sim"></a>
## 📌 macOS에서 iOS 시뮬레이터 앱 실행하기 (Capacitor)

**필수 사항 (macOS 전용)**
- Xcode (iOS 시뮬레이터/빌드에 필요)

#### 1) Capacitor 설치 (최초 1회)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

#### 2) iOS 플랫폼 추가 (최초 1회)
```bash
npm install @capacitor/ios
npx cap add ios
```

#### 3) (개발 모드) Vite dev 서버에 연결해서 핫리로드로 개발하기
네이티브 껍데기(WebView) 안에서 웹을 그대로 띄워 개발할 수 있습니다.

> ⚠️ 실제 iPhone에서 접속하려면 **iPhone과 Mac이 반드시 같은 Wi‑Fi**에 있어야 합니다. (다르면 PC/Mac의 dev 서버에 접속 불가) 같은 Wi‑Fi라면 `npm run dev` + `npm run cap:local`로 자동 설정 후 실행하세요.

1) 로컬 dev server URL 자동 설정(현재 LAN IP를 자동으로 찾아 설정 파일 생성/갱신):
```bash
npm run cap:local
```

2) 참고: 생성/갱신되는 파일
- `capacitor.config.local.json` (git ignore, 개인별 파일)

3) 네트워크(폰/에뮬레이터)에서 접근 가능하도록 Vite 실행:
```bash
npm run dev
```

4) iOS에서 HTTP 허용(개발용 설정)
- Xcode → `TARGETS > App > Info`
- `App Transport Security Settings` (Dictionary) 추가
- 그 아래에 `Allow Arbitrary Loads` (Boolean) = `YES`

5) 동기화 후 iOS 프로젝트 열기:
```bash
npx cap sync ios
npx cap open ios
```

6) Xcode에서 시뮬레이터(또는 연결된 iPhone)를 선택하고 **Run(▶︎)**.

#### 4) (배포/프로덕션 모드) 웹 빌드를 앱에 포함해서 실행하기
dev 서버 없이 앱 단독 실행이 필요할 때:
```bash
npm run build
npx cap sync ios
npx cap open ios
```
이후 Xcode에서 빌드/아카이브합니다.

---

<a id="android-emu"></a>
## 📌 Windows에서 Android 에뮬레이터 앱 실행하기 (Capacitor)

**필수 사항**
- Android Studio (Android SDK 포함)
- JDK(자바) — Android Studio가 설치해주기도 합니다

#### 1) Capacitor + Android 플랫폼 설치 (최초 1회)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/android
npx cap add android
```

#### 2) (개발 모드) Vite dev 서버에 연결해서 핫리로드로 개발하기

> ⚠️ 실제 Android 폰에서 접속하려면 **휴대폰과 PC/Mac이 반드시 같은 Wi‑Fi**에 있어야 합니다. (다르면 PC/Mac의 dev 서버에 접속 불가) 같은 Wi‑Fi라면 `npm run dev` + `npm run cap:local`로 자동 설정 후 실행하세요.

1) 로컬 dev server URL 자동 설정(현재 LAN IP를 자동으로 찾아 설정 파일 생성/갱신):
```bash
npm run cap:local
```

2) 참고: 생성/갱신되는 파일
- `capacitor.config.local.json` (git ignore, 개인별 파일)

3) 네트워크(폰/에뮬레이터)에서 접근 가능하도록 Vite 실행:
```bash
npm run dev
```

4) Android에서 HTTP가 막히는 경우(개발용)
- `android/app/src/main/AndroidManifest.xml` 열기
- `<application ...>` 태그 안에 아래 속성 추가:
```xml
android:usesCleartextTraffic="true"
```

5) 동기화 후 Android 프로젝트 열기:
```bash
npx cap sync android
npx cap open android
```

6) Android Studio에서 에뮬레이터(AVD) 또는 연결된 기기를 선택하고 **Run(▶︎)**.

#### 3) (배포/프로덕션 모드) 웹 빌드를 앱에 포함해서 실행하기
```bash
npm run build
npx cap sync android
npx cap open android
```
이후 Android Studio에서 APK/AAB를 생성합니다.
