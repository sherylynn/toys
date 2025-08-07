# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive macOS-based ADB (Android Debug Bridge) wireless debugging and device management system. The project provides both command-line and GUI-based tools for automatically scanning, connecting, and managing Android devices over WiFi, with a focus on finding specific devices and launching screen mirroring applications.

## Core Architecture

### Dual-Interface Design
The project implements a dual-interface architecture:
- **Command-line interface** (`scan.command`) - Fast, efficient scanning for power users
- **GUI interface** (`server.py` + `gui.html`) - Web-based interface for easier device management

Both interfaces share the same core functionality but provide different user experiences.

### Key Components

#### 1. Main Scanning Engine (`scan.command`)
- **Network Discovery**: Automatically detects local network segments (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- **Multi-layer Scanning**: Implements three scanning methods for reliability:
  1. Historical IP priority checking
  2. Fast parallel ping scanning with progress visualization
  3. Direct port scanning for ADB (port 5555)
- **Device Targeting**: Specifically looks for devices with "110" in their model name
- **Auto-launch**: Automatically launches multiple scrcpy instances (`sc`, `sca`, `scb`) for target devices

#### 2. GUI Server (`server.py`)
- **HTTP API**: RESTful API for device management operations
- **Real-time Status**: WebSocket-like polling for scan progress updates
- **Multi-threaded Architecture**: Handles concurrent requests efficiently
- **Device Management**: Connection, disconnection, and application launching
- **History Management**: Persistent storage of successful connections

#### 3. Web Interface (`gui.html`)
- **Modern UI**: Clean, responsive design with real-time updates
- **Device Management**: Visual device list with connection controls
- **Settings Management**: Configurable scan parameters and application preferences
- **History Tracking**: Quick access to previously connected devices
- **Progress Visualization**: Real-time scanning progress with progress bars

#### 4. Dependency Management (`install.command`)
- **Homebrew Setup**: Automatic installation of package manager
- **Tool Installation**: scrcpy (screen mirroring), nmap (network scanning)
- **Environment Verification**: Checks for existing installations

#### 5. Automation Support (`auto_accept.command`)
- **AppleScript Integration**: Automated UI interaction for ADB authorization
- **Target Application**: Monitors "Trae" application for authorization dialogs
- **Button Automation**: Automatically clicks "全部接受" (Accept All) buttons

## Development Workflow

### Primary Scripts
```bash
# Command-line scanning
./scan.command

# GUI-based management
./gui-launcher.command

# Install dependencies
./install.command

# Create desktop shortcut
./create_shortcut.command

# Auto-accept ADB authorizations
./auto_accept.command

# Server status checking
./status-check.command
```

### Testing and Debugging
```bash
# Test GUI server functionality
./test-gui.sh

# Check server status
./status-check.command

# Manual server start (for debugging)
python3 server.py

# View server logs
tail -f server.log
```

### Common Development Commands
```bash
# Make all scripts executable
chmod +x *.command

# Kill existing server process
pkill -f "python3 server.py"

# Check port 8080 usage
lsof -i :8080

# Test individual API endpoints
curl -s http://localhost:8080/status
curl -s http://localhost:8080/devices
curl -s http://localhost:8080/scan-devices -X POST -H "Content-Type: application/json" -d '{"timeout": 3}'
```

## Key Files and Their Roles

### Core Scripts
- **`scan.command`** - Main ADB device scanning tool with parallel processing and multi-layered network discovery
- **`server.py`** - HTTP server providing REST API for device management with multi-threaded architecture
- **`gui.html`** - Web-based user interface with real-time updates and responsive design
- **`gui-launcher.command`** - Server startup script with dependency checking and automatic browser opening

### Configuration and Data
- **`ip.txt`** - Persistent history of successfully connected device IPs for fast reconnection
- **`requirements.txt`** - Project specifications and technical requirements (Chinese)

### Supporting Tools
- **`install.command`** - Dependency installer for Homebrew, scrcpy, nmap
- **`auto_accept.command`** - AppleScript automation for ADB authorization dialogs
- **`create_shortcut.command`** - Desktop shortcut creator for easy access
- **`status-check.command`** - Server health monitoring with API endpoint testing
- **`test-gui.sh`** - Comprehensive GUI server functionality testing script

### Log Files
- **`server.log`** - Main server log file for debugging and monitoring
- **`server_*.log`** - Additional log files for specific debugging scenarios

## Technical Implementation Details

### Network Scanning Strategy
The scanner uses a sophisticated multi-layered approach:

1. **Historical IP Priority**: Checks previously connected devices first, prioritizing same-subnet devices
2. **Fast Ping Scan**: Parallel ping sweep using background processes with real-time progress bars
3. **Port Scanning**: Efficient TCP connect scanning for ADB port 5555
4. **Common IP Fallback**: Scans known device IPs if other methods fail

### Performance Optimizations
- **Parallel Processing**: Uses background processes for concurrent network operations
- **Progress Visualization**: Real-time progress bars with percentage completion
- **Timeout Management**: Configurable timeouts for network operations
- **Subnet Awareness**: Prioritizes devices from the same network segment

### Device Targeting Logic
- **Pattern Matching**: Searches for devices with "110" in model name
- **Multi-instance Launching**: Starts multiple scrcpy instances (`sc`, `sca`, `scb`)
- **Automatic Connection**: Establishes ADB connection before launching applications
- **History Integration**: Maintains persistent connection history for faster reconnection

### GUI Architecture
- **RESTful API**: Clean HTTP endpoints for all operations
- **Real-time Updates**: Polling-based status updates for scan progress
- **Responsive Design**: Mobile-friendly web interface
- **Settings Persistence**: LocalStorage for user preferences
- **Error Handling**: Comprehensive error reporting and recovery

## Security Considerations

### Script Security
- **Execution Permissions**: All `.command` files require execute permissions
- **Network Scoping**: Limited to local network segments only
- **No Credential Storage**: Only IP addresses are persisted, no authentication data

### ADB Security
- **Authorization Handling**: AppleScript automation for accepting ADB connections
- **Connection Validation**: Verifies successful ADB connections before proceeding
- **Automatic Disconnect**: Cleans up connections when operations complete

## Dependencies and Environment

### Required Tools
- **adb** - Android Debug Bridge (part of Android SDK Platform Tools)
- **scrcpy** - Android screen mirroring tool
- **python3** - For GUI server functionality
- **Homebrew** - macOS package manager

### Optional Tools
- **nmap** - Advanced network scanning capabilities
- **Custom Scripts**: `sc`, `sca`, `scb` aliases for scrcpy instances

### Shell Environment
- **zsh** - Default shell for macOS scripts
- **AppleScript** - For UI automation features
- **Standard Unix Tools**: curl, ping, ifconfig, etc.

## Common Development Tasks

### Adding New Device Patterns
Modify device matching logic in both `scan.command` and `server.py`:
```bash
# In scan.command (line ~244)
if [[ "$device_name" == *"NEW_PATTERN"* ]]; then
```

### Modifying Scan Parameters
Adjust timeout values, parallel processes, or IP ranges in:
- `scan.command` - Command-line interface
- `server.py` - GUI interface (ADBScanner class)

### Enhancing GUI Features
Update `gui.html` and corresponding API endpoints in `server.py`:
- Add new device actions
- Modify settings interface
- Enhance progress visualization

### Network Optimization
Improve scanning algorithms in both interfaces:
- Add new network detection methods
- Optimize parallel processing
- Enhance error handling

## File Permissions
All `.command` files must be executable:
```bash
chmod +x *.command
```

## Environment Requirements
- macOS with AppleScript support
- Android SDK Platform Tools (adb)
- Network access to target devices
- ADB wireless debugging enabled on Android devices
- Python 3.6+ for GUI functionality
- zsh shell (default on modern macOS)

## Build and Development Process
The project uses a script-based approach without traditional compilation:
1. Scripts are written in zsh for maximum macOS compatibility
2. GUI server uses Python with standard library modules (no external dependencies)
3. Web interface uses vanilla HTML/CSS/JavaScript (no build process)
4. Dependencies are managed through Homebrew
5. All scripts require execute permissions (`chmod +x`)

## Important Notes for Development

### Server Port Management
- The GUI server runs on port 8080 by default
- Use `pkill -f "python3 server.py"` to stop existing server instances
- Check port usage with `lsof -i :8080`

### Script Execution
- All `.command` files must be executable: `chmod +x *.command`
- Scripts are designed to be run from the project directory
- The `gui-launcher.command` handles server startup and automatic browser opening

### Device Discovery Architecture
The system implements a sophisticated multi-layered scanning approach:
1. **Historical IP Priority**: Checks `ip.txt` for previously connected devices first
2. **Fast Network Scan**: Parallel ping scanning of local subnet (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
3. **Port Scanning**: TCP connect scanning for ADB port 5555
4. **Common IP Fallback**: Scans known device IP ranges if other methods fail

This architecture ensures easy deployment and maintenance while providing powerful device management capabilities.