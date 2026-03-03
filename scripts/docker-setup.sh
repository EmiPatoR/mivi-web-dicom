#!/bin/bash
echo "🐳 Setting up Docker integration..."

# Update docker-compose.yml to include worklist manager
cat > docker-compose.yml << 'DOCKER_EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: worklist-db
    environment:
      - POSTGRES_DB=worklist
      - POSTGRES_USER=worklist
      - POSTGRES_PASSWORD=worklist123
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

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
    environment:
      - DATABASE_URL=postgresql://worklist:worklist123@postgres:5432/worklist
      - AUTO_MIGRATE=true
    depends_on:
      - orthanc
      - postgres
    restart: unless-stopped

volumes:
  orthanc-db:
  postgres-data:
DOCKER_EOF

# Create Dockerfile for the worklist manager
cat > Dockerfile << 'DOCKER_EOF'
FROM denoland/deno:latest

WORKDIR /app

# Copy application files
COPY deno.json ./deno.json
COPY drizzle.config.ts ./drizzle.config.ts
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY worklists/ ./worklists/

# Expose port
EXPOSE 8080

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "backend/main.ts"]
DOCKER_EOF

echo "✅ Docker setup complete!"
echo "🚀 Run: docker-compose up -d"
