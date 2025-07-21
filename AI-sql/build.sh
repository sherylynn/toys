#!/bin/bash

# Build script for the backend and frontend

# Build backend
echo "Building backend..."
cd backend
GOOS=linux GOARCH=arm64 go build -o ../bin/server cmd/server/main.go
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Build complete. Executables are in bin/ and frontend build is in frontend/build/"
