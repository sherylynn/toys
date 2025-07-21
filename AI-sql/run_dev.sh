#!/bin/bash

# This script will be used to start the development environment and run Cypress tests.

# Function to kill background processes on exit
cleanup() {
  echo "Stopping background processes..."
  kill $(jobs -p)
  echo "Cleanup complete."
}

trap cleanup EXIT

# Start the backend server
echo "Starting backend server..."
cd backend
go run cmd/server/main.go > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start the frontend server
echo "Starting frontend server..."
cd frontend
PORT=3000 npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
until curl -s http://localhost:8080/ping > /dev/null; do
  sleep 1
done
echo "Backend is ready."

# Wait for frontend to be ready
echo "Waiting for frontend to be ready..."
until curl -s http://localhost:3000 > /dev/null; do
  sleep 1
done
echo "Frontend is ready."

# Run Cypress tests
echo "Running Cypress tests..."
cd frontend
npm run cypress:run

# The cleanup trap will handle killing the background processes