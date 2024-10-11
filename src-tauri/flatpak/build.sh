#!/bin/sh

# get version from tauri.conf.json, don't use jq
VERSION=$(grep -oP '"version": "\K(.*)(?=")' ../tauri.conf.json)
echo Building flatpak for chrono-sleuth v$VERSION

# remove old builds
rm -f *.flatpak

# get latest github deb SHA256
URL=https://github.com/amcolash/chrono-sleuth/releases/download/app-v${VERSION}/chrono-sleuth_${VERSION}_amd64.deb
SHA256=$(curl -sL $URL | sha256sum | cut -d ' ' -f 1)

# update the flatpak manifest
sed -i "s/chrono-sleuth_.*_amd64.deb/chrono-sleuth_${VERSION}_amd64.deb/g" com.amcolash.chrono-sleuth.yml
sed -i "s/sha256: .*/sha256: $SHA256/g" com.amcolash.chrono-sleuth.yml

# build the flatpak
flatpak-builder --force-clean --user --install-deps-from=flathub --repo=repo --install dist com.amcolash.chrono-sleuth.yml
flatpak build-bundle repo chrono-sleuth_${VERSION}_amd64.flatpak com.amcolash.chrono-sleuth --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo
