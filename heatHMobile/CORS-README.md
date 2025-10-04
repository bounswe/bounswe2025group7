# CORS Issue and Solutions

## Problem
When running the mobile app on **web browser** (via `npm run web`), you'll encounter CORS errors because:
- The app runs at `http://localhost:8081`
- The backend is at `http://35.198.76.72:8080`
- Browsers block cross-origin requests without proper CORS headers

**Important:** CORS is ONLY a browser issue. Native iOS/Android apps don't have this restriction.

## Solutions

### ✅ Recommended: Test on Mobile Device/Emulator

**iOS Simulator:**
```bash
cd heatHMobile
npm run ios
```

**Android Emulator:**
```bash
cd heatHMobile
npm run android
```

**Physical Device:**
```bash
cd heatHMobile
npm start
# Scan the QR code with Expo Go app
```

### 🔧 Current Web Solution: CORS Proxy

For **web development only**, the app automatically uses a CORS proxy service (`corsproxy.io`):
- ✅ Bypasses CORS restrictions
- ✅ Works immediately without setup
- ⚠️ Only for development/testing
- ⚠️ May be slower than direct connection
- ⚠️ Should NOT be used in production

The configuration automatically detects when running on web and uses the proxy.

### 🎯 Alternative: Local Backend

If you have control over the backend, add CORS headers:

**Java/Spring Boot:**
```java
@CrossOrigin(origins = "http://localhost:8081")
```

## Current Configuration

The app automatically detects the platform and uses appropriate settings:

- **iOS/Android:** Direct connection to `http://35.198.76.72:8080/api`
- **Web:** CORS proxy `https://corsproxy.io/?http://35.198.76.72:8080/api`

To change this, edit `heatHMobile/constants/config.ts`

## Testing Checklist

✅ Test on web browser (with CORS proxy) - for quick development
✅ Test on iOS Simulator - for iOS-specific features
✅ Test on Android Emulator - for Android-specific features
✅ Test on physical device - for real-world performance

