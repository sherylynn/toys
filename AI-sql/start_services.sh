#!/bin/bash

echo "Starting backend server..."
cd backend
# Ensure the database is initialized and seeded
go run cmd/server/main.go > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Starting frontend development server..."
cd frontend
PORT=3000 npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Backend is running on http://localhost:8080 (logs in backend.log)"
echo "Frontend is running on http://localhost:3000 (logs in frontend.log)"
echo "To stop services, run: kill $BACKEND_PID $FRONTEND_PID or killall go node"

wait # Keep the script running until background processes are manually stopped
