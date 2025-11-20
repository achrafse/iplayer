# iPlayer - Cross-Platform IPTV Player

A modern IPTV player application built with React Native (Expo) supporting Android, iOS, Android TV, and Web platforms using Xtream Codes API.

## 🚀 Features

- **Cross-Platform**: Single codebase for Android, iOS, Android TV, and Web (LG webOS, Samsung Tizen)
- **Direct Credentials**: Login with username, password, and server URL
- **Live TV**: Browse and watch live TV channels by category
- **VOD & Series**: Support for Video on Demand and Series (ready to implement)
- **Video Player**: Custom HLS/M3U8 video player with controls
- **Authentication**: Secure credential storage and auto-login
- **TV Optimized**: D-pad navigation support for TV platforms
- **CI/CD**: Automated builds for all platforms via GitHub Actions

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Expo CLI
- For iOS builds: macOS with Xcode
- For Android builds: Android Studio (optional)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd IPLAYER
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

## 📱 Running on Different Platforms

### Android Mobile
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web (for LG webOS & Samsung Tizen)
```bash
npm run web
```

### Android TV
```bash
# Connect Android TV device via ADB
adb connect <TV_IP_ADDRESS>
npm run android
```

## 🏗️ Building for Production

### Using EAS Build (Recommended)

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure your project**
```bash
eas build:configure
```

4. **Build for Android**
```bash
npm run build:android
```

5. **Build for iOS**
```bash
npm run build:ios
```

6. **Build for all platforms**
```bash
npm run build:all
```

## 🔧 Configuration

### IPTV Credentials

The app uses Xtream Codes API with the following structure:
- **Server URL/DNS**: Your IPTV provider's server address
- **Username**: Your account username
- **Password**: Your account password

Example credentials format:
```typescript
{
  serverUrl: "taspazgc.ott-smart.xyz",
  username: "7QYG7NRU",
  password: "PQXP2S58"
}
```

### App Configuration

Edit `app.json` to customize:
- App name and display name
- Bundle identifiers
- Icons and splash screens
- Permissions

## 📦 Project Structure

```
IPLAYER/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout with auth provider
│   ├── index.tsx            # Initial splash/routing screen
│   ├── login.tsx            # Login screen
│   ├── home.tsx             # Home screen with categories
│   └── player.tsx           # Video player screen
├── src/
│   ├── components/          # Reusable components
│   │   └── VideoPlayer.tsx  # Custom video player
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── services/            # API services
│   │   └── iptv.service.ts  # Xtream Codes API integration
│   ├── types/               # TypeScript types
│   │   └── iptv.types.ts    # IPTV data types
│   └── utils/               # Utilities
│       └── storage.ts       # AsyncStorage wrapper
├── .github/workflows/       # CI/CD workflows
│   └── build.yml           # Automated build pipeline
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
└── package.json             # Dependencies
```

## 🚀 CI/CD Pipeline

The project includes a GitHub Actions workflow that automatically builds:

1. **Android Mobile APK**
2. **Android TV APK**
3. **iOS IPA** (requires Apple Developer account)
4. **Web Build** (deployable to GitHub Pages)

### Setup GitHub Actions

1. Add `EXPO_TOKEN` to your GitHub repository secrets:
   - Generate token: `npx expo login` then `npx expo whoami --token`
   - Go to: Repository Settings → Secrets → New repository secret
   - Name: `EXPO_TOKEN`
   - Value: Your Expo token

2. Push to main/master branch to trigger builds

## 🌐 Deploying to TV Platforms

### Android TV
1. Build APK using EAS or GitHub Actions
2. Sideload APK to Android TV device
3. Or publish to Google Play Store

### LG webOS
1. Build web version: `npx expo export --platform web`
2. Package as webOS app using LG webOS SDK
3. Submit to LG Content Store

### Samsung Tizen
1. Build web version: `npx expo export --platform web`
2. Package as Tizen app using Tizen Studio
3. Submit to Samsung Apps TV Store

## 🎯 Xtream Codes API Endpoints

The app supports all standard Xtream Codes API endpoints:

- `player_api.php` - Authentication and main API
- `get_live_categories` - List live TV categories
- `get_live_streams` - List live TV channels
- `get_vod_categories` - List VOD categories
- `get_vod_streams` - List VOD content
- `get_series_categories` - List series categories
- `get_series_info` - Get series details
- `get_simple_data_table` - Get EPG data

## 📝 TODO / Future Enhancements

- [ ] Add VOD (Video on Demand) screens
- [ ] Add Series/TV Shows screens
- [ ] Implement EPG (Electronic Program Guide) display
- [ ] Add favorites functionality
- [ ] Add parental controls
- [ ] Add subtitle support
- [ ] Add multi-audio track selection
- [ ] Add Chromecast support
- [ ] Add picture-in-picture mode
- [ ] Add download for offline viewing
- [ ] Add search functionality
- [ ] Add voice control for TV platforms

## 🐛 Troubleshooting

### Video not playing
- Check your internet connection
- Verify IPTV credentials are correct
- Ensure the stream URL is valid
- Check if your provider supports HLS/M3U8 streams

### Build errors
- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo SDK: `npx expo upgrade`

### Android TV not detecting
- Enable ADB debugging on TV
- Use: `adb connect <TV_IP>`
- Verify connection: `adb devices`

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This is a minimal implementation. You may need to add more features based on your specific IPTV provider's API capabilities and your requirements.
