# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered financial report analysis system (AI财报分析系统) that downloads and analyzes Chinese stock market financial reports from CNINFO (巨潮信息网). The system is now implemented entirely in Go, providing a unified and efficient backend solution.

## Architecture

The project consists of the following components:

### Backend Services
- **Go HTTP Server** (`main.go:8080`) - Main backend server with embedded frontend
- **Report Downloader** - Downloads financial reports from CNINFO API
- **Static File Server** - Serves downloaded reports and frontend assets

### Frontend
- **Vue.js 3** with Element Plus UI components
- **Vite** build system with proxy configuration
- **Excel Viewer** component for spreadsheet display
- **Report Analysis** component for financial data processing

### Android App
- **Kotlin** Android application in `stockviewer/` directory
- **Report downloading** and management features
- **Multi-fragment UI** with navigation drawer

## Common Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Go Backend
```bash
# Install Go dependencies
go mod tidy

# Run Go server
go run main.go

# Build for multiple platforms
go build -o ai-stock main.go

# Cross-platform build (if build.sh exists)
./build.sh
```

### Project Setup
```bash
# Full project initialization
./start.sh
```

## Key Components

### Report Download System
- **Location**: `main.go:100-306`
- **Function**: Downloads quarterly and annual reports from CNINFO
- **Features**: Company search, year-based filtering, duplicate detection

### API Endpoints
- `GET /api/reports` - List downloaded reports
- `POST /api/download` - Download new reports

### File Structure
```
downloads/           # Downloaded PDF reports (auto-created)
src/                # Vue.js frontend source
stockviewer/        # Android app source
dist/               # Built frontend assets (for Go embedding)
```

## Configuration

### Environment Variables
- `VITE_API_URL` - Backend API URL (default: http://localhost:8080)

### Proxy Configuration
Frontend development server proxies `/api` requests to the Go backend automatically.

## Data Flow

1. **User Input** → Frontend Vue.js components
2. **API Request** → Go backend server
3. **Report Download** → CNINFO API integration
4. **File Storage** → Local `downloads/` directory
5. **Display** → Frontend visualization components

## Development Notes

- The system now uses only Go as the backend language
- Frontend is built with Vue 3 and Element Plus
- Android app provides mobile access to report downloads
- All downloaded files are stored in `downloads/` directory organized by company/year
- The Go backend embeds the frontend build for standalone deployment
- Use `start.sh` for full development environment setup
- The system has been simplified to remove Python dependencies and complexity