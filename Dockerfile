# Use the latest Deno image
FROM denoland/deno:latest

# Install minimal system dependencies (no dcmtk needed anymore!)
RUN apt-get update && \
    apt-get install -y \
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

# Cache dependencies (including dcmjs)
RUN deno cache backend/server.ts

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8092/health || exit 1

# Expose port
EXPOSE 8092

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "backend/server.ts"]
