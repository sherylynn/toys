# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive macOS-based ADB (Android Debug Bridge) wireless debugging and device management system. The project provides three interfaces: command-line (`scan.command`), web-based GUI (`server.py` + `gui.html`), and a native macOS menu bar application (`menu_bar_app_native.py`). The system specializes in automatically scanning, connecting, and managing Android devices over WiFi, with intelligent device targeting and multi-instance screen mirroring capabilities.

## Core Architecture

### Triple-Interface Design
- **Command-line interface** (`scan.command`) - Fast, efficient scanning with parallel processing
- **GUI interface** (`server.py` + `gui.html`) - Web-based interface with real-time updates
- **Menu bar interface** (`menu_bar_app_native.py`) - Native macOS menu bar with smart device categorization

### Key Components

#### 1. Main Scanning Engine (`scan.command`)
- **Multi-layer Network Discovery**: 
  - Historical IP priority checking from `ip.txt`
  - Parallel ping scanning with background processes and progress bars
  - Direct TCP port scanning for ADB (port 5555)
  - Common IP fallback mechanism
- **Intelligent Device Targeting**: Pattern matching for device model names (default "110")
- **Auto-launch System**: Automatically starts multiple scrcpy instances (`sc`, `sca`, `scb`)
- **Performance Optimizations**: Background processes, timeout management, subnet awareness

#### 2. GUI Server (`server.py`)
- **RESTful API**: HTTP endpoints for all device operations
- **Multi-threaded Architecture**: `ThreadPoolExecutor` for concurrent operations
- **Real-time Status Updates**: Polling-based progress tracking
- **ADBScanner Class**: Encapsulates all ADB operations with error handling
- **Persistent History**: Maintains connection history in `ip.txt`

#### 3. Web Interface (`gui.html`)
- **Single-page Application**: Vanilla JavaScript with responsive design
- **Real-time Updates**: Periodic polling for scan progress and device status
- **Settings Management**: LocalStorage-based configuration persistence
- **Interactive Controls**: Device connection, disconnection, and application launching

#### 4. Menu Bar Application (`menu_bar_app_native.py`)
- **Smart Menu Structure**: Dynamic menu hierarchy based on device targeting
- **Device Categorization**: Separates target devices from others with different UI treatments
- **PyObjC Implementation**: Native macOS integration using AppKit framework
- **Intelligent Actions**: Context-aware device commands and quick access

#### 5. Dependency Management (`install.command`)
- **Automated Setup**: Homebrew installation and verification
- **Tool Chain**: scrcpy, nmap, ADB tools installation
- **Environment Validation**: Checks for existing dependencies

## Development Workflow

### Primary Scripts
```bash
# Command-line scanning (main tool)
./scan.command

# GUI-based management
./gui-launcher.command

# Menu bar application (native macOS)
./menu-bar-launcher.command

# Install dependencies
./install.command

# Create desktop shortcut
./create_shortcut.command
```

### Testing and Debugging
```bash
# Manual server start (for debugging)
python3 server.py

# Test menu bar application (direct execution)
python3 menu_bar_app_native.py

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

# Test device connection
adb devices
adb connect <device_ip>:5555
```

### Menu Bar Application Development
```bash
# Test menu bar with different device scenarios
# 1. No devices connected
# 2. Only target devices (model name contains "110")
# 3. Only non-target devices
# 4. Mixed devices

# Debug menu bar state
# Check system logs for menu bar app output
log stream --predicate 'process == "python3"' --info
```

## Key Files and Their Roles

### Core Scripts
- **`scan.command`** - Main ADB device scanning tool with multi-layered network discovery and parallel processing
- **`server.py`** - HTTP server providing REST API for device management with multi-threaded architecture
- **`gui.html`** - Single-page web application with real-time updates and responsive design
- **`gui-launcher.command`** - Server startup script with dependency checking and automatic browser opening
- **`menu_bar_app_native.py`** - Native macOS menu bar application with intelligent device categorization

### Configuration and Data
- **`ip.txt`** - Persistent history of successfully connected device IPs for fast reconnection
- **`requirements.txt`** - Original project specifications (Chinese, describes Go implementation that was replaced)
- **`MENU_BAR_LOGIC.md`** - Detailed documentation of menu bar application logic and behavior

### Supporting Tools
- **`install.command`** - Automated dependency installer for Homebrew, scrcpy, nmap
- **`create_shortcut.command`** - Desktop shortcut creator for easy access
- **`menu-bar-launcher.command`** - Menu bar application launcher with error handling

## Technical Implementation Details

### Network Scanning Strategy
The scanner implements a sophisticated multi-layered approach:

1. **Historical IP Priority**: Reads `ip.txt` and attempts connections to previously successful devices first
2. **Fast Ping Scan**: Parallel background processes with real-time progress visualization and percentage completion
3. **Direct Port Scanning**: TCP connect scanning specifically for ADB port 5555
4. **Subnet Discovery**: Automatically detects local network segments (192.168.x.x, 10.x.x.x, 172.16-31.x.x)

### Performance Optimizations
- **Background Processing**: Uses zsh background jobs (`&`) for concurrent network operations
- **Progress Visualization**: Real-time progress bars with completion percentages and ETA
- **Timeout Management**: Configurable timeouts for all network operations with graceful degradation
- **Connection Prioritization**: Same-subnet devices get priority over cross-subnet connections

### Device Targeting and Launch System
- **Pattern Matching**: Searches device model names for target string (default "110")
- **Multi-instance Launching**: Automatically starts `sc`, `sca`, `scb` instances for target devices
- **Script Integration**: Loads `toolsinit.sh` for custom script aliases and functions
- **IP Processing**: Handles both raw IPs and IP:port formats automatically

### Menu Bar Application Architecture
- **Smart Menu Hierarchy**: Dynamic structure based on device targeting (see `MENU_BAR_LOGIC.md`)
- **Device Categorization**: Separates target devices (🎯) from others (📱) with different UI treatments
- **PyObjC Integration**: Native macOS AppKit framework for system integration
- **Dynamic Menu Management**: Runtime menu construction and cleanup with proper memory management

### GUI Server Architecture
- **Multi-threaded Design**: `ThreadPoolExecutor` with `MAX_WORKERS=50` for concurrent operations
- **State Management**: Global `scan_status` dictionary for real-time progress tracking
- **RESTful Endpoints**: Clean HTTP API with JSON request/response handling
- **ADB Integration**: `ADBScanner` class encapsulates all ADB operations with error handling

## Dependencies and Environment

### Required Tools
- **adb** - Android Debug Bridge (part of Android SDK Platform Tools)
- **scrcpy** - Android screen mirroring tool
- **python3** - For GUI server and menu bar functionality
- **Homebrew** - macOS package manager

### Optional Tools
- **nmap** - Advanced network scanning capabilities
- **Custom Scripts**: `sc`, `sca`, `scb` aliases defined in `toolsinit.sh`

### Shell Environment
- **zsh** - Default shell for all macOS scripts
- **Standard Unix Tools**: curl, ping, ifconfig, tcpconnect
- **PyObjC** - For native macOS menu bar application

## Common Development Tasks

### Modifying Device Targeting
Update device pattern matching in multiple locations:
- **CLI Interface**: `scan.command` (line ~244) - modify device name matching logic
- **GUI Server**: `server.py` (ADBScanner class) - update pattern matching
- **Menu Bar**: `menu_bar_app_native.py` - update `self.target_device_name` logic

### Menu Bar Application Development
1. **Logic Changes**: Update `MENU_BAR_LOGIC.md` first, then implement in `menu_bar_app_native.py`
2. **Menu Structure**: Modify `update_device_menu()` method for hierarchy changes
3. **Device Actions**: Add new actions by creating new methods and menu items
4. **Settings Integration**: Update `show_settings()` for new configuration options

### Network Scanning Enhancements
- **Timeout Configuration**: Modify timeout values in `scan.command` and `server.py`
- **Parallel Processing**: Adjust background process counts in `scan.command`
- **IP Range Management**: Update subnet discovery logic in both scanning engines

### GUI Feature Development
1. **API Endpoints**: Add new endpoints in `server.py`
2. **Frontend Updates**: Modify `gui.html` JavaScript and HTML
3. **Settings Persistence**: Update LocalStorage handling in web interface

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
- PyObjC framework (usually included with Python)

## Build and Development Process
The project uses a script-based approach without traditional compilation:
1. **CLI Scripts**: zsh shell scripts for maximum macOS compatibility
2. **GUI Server**: Python with standard library (no external dependencies)
3. **Web Interface**: Vanilla HTML/CSS/JavaScript (no build process)
4. **Menu Bar**: Python with PyObjC for native macOS integration
5. **Dependencies**: Managed through Homebrew automation
6. **Execution**: All `.command` files require execute permissions

## Project Structure
```
mac-script/
├── scan.command              # Main CLI scanning tool (zsh)
├── server.py                 # HTTP server for GUI (Python)
├── gui.html                  # Web interface (HTML/JS/CSS)
├── gui-launcher.command      # GUI server launcher (zsh)
├── menu-bar-launcher.command # Menu bar app launcher (zsh)
├── menu_bar_app_native.py    # Native macOS menu bar app (Python/PyObjC)
├── menu_bar_app.py           # Alternative menu bar app (Python/rumps)
├── install.command           # Dependency installer (zsh)
├── create_shortcut.command   # Desktop shortcut creator (zsh)
├── ip.txt                    # Connection history (data)
├── requirements.txt          # Original project specs (Chinese)
└── MENU_BAR_LOGIC.md         # Menu bar application documentation
```

## Important Notes for Development

### Server Port Management
- **Default Port**: GUI server runs on port 8080
- **Process Management**: Use `pkill -f "python3 server.py"` to stop server instances
- **Port Conflicts**: Check usage with `lsof -i :8080`

### Script Execution Environment
- **File Permissions**: All `.command` files must be executable
- **Working Directory**: Scripts assume execution from project directory
- **Shell Environment**: zsh with access to user environment and aliases
- **Tool Integration**: Scripts load `toolsinit.sh` for custom functions

### Menu Bar Application Specifics
- **Smart Menu Logic**: Refer to `MENU_BAR_LOGIC.md` for detailed behavior specification
- **Device Categorization**: Target devices (🎯) vs others (📱) with different UI treatments
- **Dynamic Structure**: Menu hierarchy adapts based on connected device types
- **State Management**: Proper cleanup of dynamic menu items to prevent memory leaks

### Multi-Interface Consistency
When modifying device discovery or targeting logic, ensure consistency across:
1. **CLI Interface** (`scan.command`)
2. **GUI Server** (`server.py`)
3. **Menu Bar App** (`menu_bar_app_native.py`)
4. **Documentation** (`MENU_BAR_LOGIC.md`)

### Device Discovery Architecture
The system implements a sophisticated multi-layered scanning approach:
1. **Historical Priority**: `ip.txt` provides fast reconnection to previously successful devices
2. **Parallel Scanning**: Background processes for concurrent network operations
3. **Subnet Discovery**: Automatic detection of local network segments
4. **Target Filtering**: Pattern-based device identification and prioritization