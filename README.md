# DICOM Worklist Manager

A web application for managing DICOM worklists for ultrasound machines, built with React and Deno.

## Features

- 🖥️ Web interface for creating DICOM worklist items
- 🔄 Automatic conversion to binary DICOM format
- 🏥 Integration with Orthanc DICOM server
- 🔍 Support for Samsung WS80A and other ultrasound machines
- 📋 Patient management and scheduling
- 🗑️ Delete completed worklist items

## Prerequisites

- Deno runtime
- DCMTK tools (for dump2dcm)
- Docker & Docker Compose (optional)

## Quick Start

### Method 1: Local Development

1. Install dependencies:
   ```bash
   # Install Deno
   curl -fsSL https://deno.land/x/install/install.sh | sh
   
   # Install DCMTK
   sudo pacman -S dcmtk  # Arch Linux
   sudo apt-get install dcmtk  # Ubuntu/Debian
   ```

2. Start the application:
   ```bash
   ./scripts/start.sh
   ```

3. Open http://localhost:8080 in your browser

### Method 2: Docker

1. Setup Docker containers:
   ```bash
   ./scripts/docker-setup.sh
   ```

2. Start everything:
   ```bash
   docker-compose up -d
   ```

3. Access:
   - Worklist Manager: http://localhost:8080
   - Orthanc: http://localhost:8042

## Usage

1. **Create New Patient**: Click "New Patient" and fill in the form
2. **Auto-generation**: Leave Accession Number and Patient ID empty for auto-generation
3. **DICOM Conversion**: The app automatically converts to binary DICOM format
4. **Ultrasound Integration**: Configure your ultrasound machine to query Orthanc worklists

## Samsung WS80A Configuration

1. Go to System → DICOM Setup on your WS80A
2. Set:
   - Local AE Title: `WS80A`
   - Server AE Title: `ORTHANC`
   - Server IP: `[Your Orthanc IP]`
   - Server Port: `4242`

## File Structure

```
dicom-worklist-manager/
├── backend/
│   └── server.ts          # Deno server
├── frontend/
│   ├── App.jsx           # React component
│   └── index.html        # HTML template
├── worklists/            # Generated DICOM files
├── scripts/
│   ├── start.sh          # Startup script
│   └── docker-setup.sh   # Docker setup
└── README.md
```

## API Endpoints

- `GET /api/worklists` - List all worklist items
- `POST /api/worklists` - Create new worklist item
- `DELETE /api/worklists/:filename` - Delete worklist item
- `GET /health` - Health check

## Development

The application uses:
- **Frontend**: React with Tailwind CSS
- **Backend**: Deno with TypeScript
- **DICOM**: DCMTK tools for binary conversion
- **Integration**: Orthanc DICOM server

## Troubleshooting

1. **dump2dcm not found**: Install DCMTK tools
2. **Permission denied**: Check file permissions in worklists directory
3. **Port conflicts**: Ensure ports 8080 and 8042 are available
4. **Ultrasound not connecting**: Verify network configuration and AE titles
