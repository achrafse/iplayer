# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm start
```

### 3. Choose Your Platform

**Option A: Scan QR Code with Expo Go App**
- Install Expo Go on your phone (iOS/Android)
- Scan the QR code from the terminal
- Enter your IPTV credentials

**Option B: Run on Emulator**
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

### 4. Login

Use your IPTV provider's credentials:
- **Server URL**: e.g., `taspazgc.ott-smart.xyz`
- **Username**: Your IPTV username
- **Password**: Your IPTV password

## 📱 Testing on Android TV

1. Enable Developer Options on your Android TV
2. Enable ADB debugging
3. Connect via ADB:
```bash
adb connect <YOUR_TV_IP>:5555
```
4. Run the app:
```bash
npm run android
```

## 🌐 Testing Web Version

1. Start web server:
```bash
npm run web
```
2. Open browser at `http://localhost:8081`
3. This web build works on LG webOS and Samsung Tizen browsers

## 🏗️ Building for Production

### Android APK
```bash
# Install EAS CLI (one time)
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile production
```

### iOS IPA (requires Mac + Apple Developer account)
```bash
eas build --platform ios --profile production
```

### Web Build (for LG/Samsung TV)
```bash
npx expo export --platform web
# Output will be in the 'dist' folder
```

## ⚙️ Customization

### Change App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-name"
  }
}
```

### Change App Icon
Replace these files in `assets/` folder:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash-icon.png` (1284x2778)

### Change Theme Colors
Edit styles in:
- `app/login.tsx`
- `app/home.tsx`
- `src/components/VideoPlayer.tsx`

## 🐛 Common Issues

**Error: "Metro bundler failed to start"**
```bash
npx expo start --clear
```

**Error: "Unable to resolve module"**
```bash
rm -rf node_modules
npm install
```

**Video not playing**
- Verify your IPTV credentials
- Check internet connection
- Ensure streams are in HLS/M3U8 format

## 📚 Next Steps

- Explore the codebase
- Add VOD and Series screens
- Customize the UI/UX
- Add more features from the TODO list
- Deploy to app stores

## 🆘 Need Help?

- Check the full README.md
- Review the code documentation
- Open an issue on GitHub

---

Happy coding! 🎉
