#!/bin/bash
echo "🐳 Setting up Docker integration..."

# Update docker-compose.yml to include worklist manager
cat > docker-compose.yml << 'DOCKER_EOF'
version: '3.8'

services:
  orthanc:
    image: orthancteam/orthanc:latest
    container_name: orthanc
    ports:
      - "8042:8042"  # Orthanc web interface
      - "4242:4242"  # DICOM port
    volumes:
      - orthanc-db:/var/lib/orthanc/db
      - ./worklists:/var/lib/orthanc/worklists  # Shared worklist directory
    environment:
      - ORTHANC__NAME=MyOrthanc
      - ORTHANC__DICOM_AET=ORTHANC
      - ORTHANC__AUTHENTICATION_ENABLED=false
      - ORTHANC__WORKLISTS__ENABLE=true
      - ORTHANC__WORKLISTS__DATABASE=/var/lib/orthanc/worklists
      - ORTHANC__DICOM_CHECK_MODALITY_HOST=false
    restart: unless-stopped

  worklist-manager:
    build: .
    container_name: worklist-manager
    ports:
      - "8080:8080"  # Worklist manager web interface
    volumes:
      - ./worklists:/app/worklists  # Shared worklist directory
    depends_on:
      - orthanc
    restart: unless-stopped

volumes:
  orthanc-db:
DOCKER_EOF

# Create Dockerfile for the worklist manager
cat > Dockerfile << 'DOCKER_EOF'
FROM denoland/deno:latest

# Install dcmtk
RUN apt-get update && apt-get install -y dcmtk && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY worklists/ ./worklists/

# Expose port
EXPOSE 8080

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-run", "backend/server.ts"]
DOCKER_EOF

echo "✅ Docker setup complete!"
echo "🚀 Run: docker-compose up -d"
