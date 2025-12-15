# Building a Signed APK for Android

This guide explains how to build a signed APK for the Winter Tower Defence game with proper screen resizing for different device sizes.

## What's Been Updated

### 1. Screen Resizing (Responsive Design)
- **Capacitor Config**: Set `resizeOnFullScreen: true` to allow the app to resize when the device rotates or dimensions change
- **AndroidManifest.xml**: Already includes `screenSize` in `configChanges`, so the app responds to screen changes
- **ResponsiveGameWrapper.tsx**: Uses CSS `--vh` variable and dynamic aspect ratio calculations to fit any device screen
- **Game Canvas**: Automatically scales to fit device viewport while maintaining aspect ratio

### 2. APK Signing Configuration
- **Build Script**: Updated `build_apk.sh` to:
  - Build the Next.js app first
  - Create a release keystore (signing key) if one doesn't exist
  - Configure Gradle with signing credentials
  - Build a signed release APK
  - Falls back to debug APK if release build fails

- **Gradle Config**: Updated `android/app/build.gradle` to:
  - Use proper signing configuration
  - Enable minification for smaller APK size
  - Use proguard rules to shrink code
  - Target the correct application ID

- **App ID**: Changed from `com.ezekiel.game` to `com.winter.towerdefence` for consistency

## Build Instructions

### Prerequisites
Ensure you have Java 17 installed:
```bash
export JAVA_HOME=/usr/lib/jvm/java-1.17.0-openjdk-amd64
export ANDROID_HOME=/usr/lib/android-sdk
```

### Building the Signed APK

Run the build script from the project root:
```bash
./build_apk.sh
```

This will:
1. ✓ Build the Next.js web app
2. ✓ Install Capacitor and Android platform
3. ✓ Create a signing keystore (first time only)
4. ✓ Build a signed release APK
5. ✓ Output `winter-tower-defense-v2.apk` in the root directory

### Signing Credentials
The build script automatically generates a signing key with:
- **Keystore File**: `release-key.keystore`
- **Keystore Password**: `android123`
- **Key Alias**: `release-key`
- **Key Password**: `android123`

⚠️ **Note**: For production releases to Google Play Store, use your own signing key and secure credentials.

## Screen Resizing Features

The app now properly handles different device sizes and orientations:

### Portrait Mode (Mobile)
- Game canvas scales down to fit narrow width
- Tower sidebar adjusts layout
- No content is cut off

### Landscape Mode (Tablet/Device)
- Game expands to use full width
- Sidebar remains on right
- Optimal use of screen space

### Dynamic Viewport
- Handles 100vh issues on mobile browsers with address bars
- Recalculates on device rotation
- Supports all screen sizes from phones to tablets

## App Size Optimization

The release build includes:
- Code minification with ProGuard
- Resource shrinking
- Optimized APK size (~30-40% smaller than debug)

## Installation

To install on a device:

```bash
# Via ADB (Android Debug Bridge)
adb install winter-tower-defense-v2.apk

# Or upload to Google Play Store for distribution
```

## Troubleshooting

### Build Fails with "Keystore not found"
- The script will automatically create one
- Delete `release-key.keystore` to regenerate if needed

### APK is Very Large
- Make sure it's the release build (not debug)
- Release APK should be ~20-30MB

### Screen Not Scaling Properly
- Clear app cache: `Settings > Apps > Winter Tower Defence > Storage > Clear Cache`
- Rotate device to trigger resize
- Force stop and restart app

### Permissions Issues
- The app only requires `INTERNET` permission (defined in AndroidManifest.xml)
- Grant permission when first launched

## Testing

After installation, test these features:
1. Rotate device between portrait/landscape - UI should adapt
2. Try different screen sizes - should scale properly
3. Play through a wave - ensure nothing is cut off
4. Check all new weapons display in sidebar - should show all towers

## Next Steps

1. **Customize Signing**: Create your own signing key for production
2. **Google Play Store**: Upload APK to distribute officially
3. **Version Updates**: Update `versionCode` in build.gradle for new releases
4. **Feature Testing**: Test on various Android devices for compatibility

---

For issues or questions about building, check the main README.md or WALKTHROUGH.md
