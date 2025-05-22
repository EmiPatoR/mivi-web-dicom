# Use the latest Deno image
FROM denoland/deno:latest

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    dcmtk \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy application files first
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY worklists/ ./worklists/

# Create necessary directories and set permissions
RUN mkdir -p ./worklists ./tmp && \
    chmod 777 ./worklists ./tmp && \
    chmod 755 ./backend/ ./frontend/

# Cache dependencies
RUN deno cache backend/server.ts

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8092/health || exit 1

# Expose port
EXPOSE 8092

# Run the application as root (for permissions)
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-run", "backend/server.ts"]
