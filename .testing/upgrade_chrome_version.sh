#!/usr/bin/env bash

# https://gist.github.com/Arjeno/8564d9643f16d072a85b9c9b5a9f7de0
curl -L -o google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -i google-chrome.deb
sed -i 's|HERE/chrome\"|HERE/chrome\" --disable-setuid-sandbox|g' /opt/google/chrome/google-chrome
rm google-chrome.deb
