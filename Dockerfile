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
