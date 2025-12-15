#!/bin/bash
set -e

# Set paths
export JAVA_HOME=/usr/lib/jvm/java-1.17.0-openjdk-amd64
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Create directory
mkdir -p $ANDROID_HOME/cmdline-tools

# Download command line tools if not exists
if [ ! -f "commandlinetools.zip" ]; then
    echo "Downloading command line tools..."
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O commandlinetools.zip
fi

# Unzip and setup SDK if not exists
if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
    echo "Extracting..."
    unzip -q commandlinetools.zip -d $ANDROID_HOME/cmdline-tools
    # The zip extracts to 'cmdline-tools', verify structure
    if [ -d "$ANDROID_HOME/cmdline-tools/cmdline-tools" ]; then
        mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest
    elif [ -d "$ANDROID_HOME/cmdline-tools/bin" ]; then
        mkdir -p $ANDROID_HOME/cmdline-tools/latest
        mv $ANDROID_HOME/cmdline-tools/bin $ANDROID_HOME/cmdline-tools/latest/
        mv $ANDROID_HOME/cmdline-tools/lib $ANDROID_HOME/cmdline-tools/latest/
        mv $ANDROID_HOME/cmdline-tools/NOTICE.txt $ANDROID_HOME/cmdline-tools/latest/ 2>/dev/null || true
        mv $ANDROID_HOME/cmdline-tools/source.properties $ANDROID_HOME/cmdline-tools/latest/ 2>/dev/null || true
    fi
    
    # Accept licenses
    echo "Accepting licenses..."
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
    
    # Install required packages
    echo "Installing platform tools and build tools..."
    $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
fi

# Downgrade Capacitor to v6
echo "Downgrading Capacitor to v6..."
npm install @capacitor/core@6 @capacitor/cli@6 @capacitor/android@6

# Re-create android platform
if [ -d "android" ]; then
    echo "Removing existing android platform..."
    rm -rf android
fi

echo "Adding android platform..."
npx cap add android

# Sync capacitor
echo "Syncing Capacitor..."
npx cap sync

# Build APK
echo "Building APK..."
cd android
./gradlew assembleDebug

# Copy APK
cp app/build/outputs/apk/debug/app-debug.apk ../winter-tower-defense-v2.apk
echo "APK build complete: winter-tower-defense-v2.apk"
