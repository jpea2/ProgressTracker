#!/bin/bash

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Please install it using: brew install imagemagick"
    exit 1
fi

# Base icon path - you'll need to provide a base image
BASE_ICON="goal-tracker-logo.png"

# Create icons directory if it doesn't exist
mkdir -p icons

# Array of icon sizes needed
SIZES=(72 96 128 144 152 192 384 512)

# Generate icons for each size
for size in "${SIZES[@]}"; do
    magick "$BASE_ICON" -resize "${size}x${size}" "icons/icon-${size}x${size}.png"
    echo "Generated ${size}x${size} icon"
done

echo "Icon generation complete!"
