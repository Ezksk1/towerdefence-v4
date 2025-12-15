#!/bin/bash
set -e
export JAVA_HOME=/usr/lib/jvm/java-1.17.0-openjdk-amd64
export ANDROID_HOME=/usr/lib/android-sdk

echo "======================================"
echo "Winter Tower Defence APK Builder"
echo "======================================"
echo ""

# Check if Next.js build exists
if [ ! -d "out" ]; then
  echo "❌ Error: Next.js build not found at ./out"
  echo "Please run: npm run build"
  exit 1
fi

echo "✓ Next.js build found"

# Ensure android directory exists
if [ ! -d "android" ]; then
  echo "❌ Error: Android directory not found"
  echo "Please run: npm install @capacitor/android"
  exit 1
fi

echo "✓ Android directory found"

# Navigate to android directory
cd android

# Create keystore if it doesn't exist
if [ ! -f "../release-key.keystore" ]; then
  echo ""
  echo "Creating release keystore..."
  keytool -genkey -v -keystore ../release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias release-key -dname "CN=Winter Tower Defence, O=Development, C=US" -storepass android123 -keypass android123
  echo "✓ Keystore created"
fi

echo ""
echo "Building Android APK..."
echo ""

# Build release APK
if ./gradlew assembleRelease 2>&1 | grep -E "BUILD|error"; then
  BUILD_TYPE="release"
  echo ""
  echo "✓ Release APK built successfully"
else
  echo ""
  echo "Release build failed, attempting debug build..."
  ./gradlew assembleDebug
  BUILD_TYPE="debug"
  echo "✓ Debug APK built successfully"
fi

# Copy APK to root
echo ""
echo "Finalizing APK..."

if [ "$BUILD_TYPE" = "release" ] && [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
  cp app/build/outputs/apk/release/app-release.apk ../winter-tower-defense-v2.apk
  echo ""
  echo "════════════════════════════════════"
  echo "✓ SIGNED APK BUILD COMPLETE!"
  echo "════════════════════════════════════"
  echo ""
  echo "Output: winter-tower-defense-v2.apk"
  echo "Type: Signed Release APK"
  ls -lh ../winter-tower-defense-v2.apk
  echo ""
elif [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
  cp app/build/outputs/apk/debug/app-debug.apk ../winter-tower-defense-v2.apk
  echo ""
  echo "════════════════════════════════════"
  echo "✓ DEBUG APK BUILD COMPLETE!"
  echo "════════════════════════════════════"
  echo ""
  echo "Output: winter-tower-defense-v2.apk"
  echo "Type: Debug APK"
  ls -lh ../winter-tower-defense-v2.apk
  echo ""
else
  echo "❌ APK file not found in expected locations"
  exit 1
fi

echo "Next steps:"
echo "  adb install winter-tower-defense-v2.apk"
echo ""
