#!/bin/bash
echo "🚀 Starting DICOM Worklist Manager..."

# Check if dcmtk is installed
if ! command -v dump2dcm &> /dev/null; then
    echo "❌ dcmtk is not installed. Please install it first:"
    echo "   sudo pacman -S dcmtk  # Arch Linux"
    echo "   sudo apt-get install dcmtk  # Ubuntu/Debian"
    exit 1
fi

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "❌ Deno is not installed. Please install it first:"
    echo "   curl -fsSL https://deno.land/x/install/install.sh | sh"
    exit 1
fi

# Start the server
echo "🌐 Starting server on http://localhost:8080"
cd backend
deno run --allow-net --allow-read --allow-write --allow-run server.ts
