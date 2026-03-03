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
- PostgreSQL (optional, for persistence)
- Docker & Docker Compose (optional)

## Quick Start

### Method 1: Local Development

1. Install dependencies:
   ```bash
   # Install Deno
   curl -fsSL https://deno.land/x/install/install.sh | sh
   ```

2. Start the application:
   ```bash
   deno task dev
   ```

3. Optional: enable PostgreSQL persistence
   ```bash
   export DATABASE_URL=postgresql://user:pass@localhost:5432/worklist
   deno task db:migrate
   ```

4. Open http://localhost:8080 in your browser

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
│   ├── main.ts            # Deno entrypoint
│   ├── server.ts          # HTTP router
│   ├── db/                # Drizzle schema + migrations
│   ├── services/          # Business logic
│   ├── dicom/             # DICOM worklist generation
│   └── http/              # Request handlers
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
- **DICOM**: dcmjs for raw worklist generation
- **Database**: Drizzle ORM with migrations

### Database & Migrations

1. Generate migrations from schema:
   ```bash
   deno task db:generate
   ```
2. Apply migrations:
   ```bash
   deno task db:migrate
   ```
3. Optional auto-migrate on startup:
   ```bash
   export AUTO_MIGRATE=true
   deno task dev
   ```

- **Integration**: Orthanc DICOM server

## Troubleshooting

1. **Permission denied**: Check file permissions in worklists directory
2. **Port conflicts**: Ensure ports 8080 and 8042 are available
3. **Ultrasound not connecting**: Verify network configuration and AE titles
