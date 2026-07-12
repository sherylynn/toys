#!/bin/bash

echo "Installing backend Go dependencies..."
cd backend
go mod tidy
cd ..

echo "Installing frontend npm dependencies..."
cd frontend
npm install
cd ..

echo "Installing system dependencies for Cypress (requires sudo)..."
sudo apt-get update
sudo apt-get install -y xvfb libatk1.0-0 libatk-bridge2.0-0 libcairo2 libcups2 libdrm2 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libxss1 libxtst6 xdg-utils libasound2 libgdk-pixbuf-xlib-2.0-0

echo "All dependencies installed."
