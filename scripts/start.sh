#!/bin/bash
echo "🚀 Starting DICOM Worklist Manager..."

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "❌ Deno is not installed. Please install it first:"
    echo "   curl -fsSL https://deno.land/x/install/install.sh | sh"
    exit 1
fi

# Start the server
echo "🌐 Starting server on http://localhost:8080"
deno task dev
