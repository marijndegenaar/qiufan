#!/bin/bash

# Installation script for WebGPU Reaction-Diffusion Nuxt Component

if [ -z "$1" ]; then
  echo "Usage: ./install.sh /path/to/your/nuxt/project"
  exit 1
fi

PROJECT_PATH="$1"

if [ ! -d "$PROJECT_PATH" ]; then
  echo "Error: Project path does not exist: $PROJECT_PATH"
  exit 1
fi

echo "Installing WebGPU Reaction-Diffusion component to $PROJECT_PATH..."

# Create directories if they don't exist
mkdir -p "$PROJECT_PATH/components"
mkdir -p "$PROJECT_PATH/utils"
mkdir -p "$PROJECT_PATH/public"

# Copy files
echo "Copying component..."
cp -r components/ReactionDiffusion.vue "$PROJECT_PATH/components/"

echo "Copying WebGPU utilities..."
cp -r utils/webgpu "$PROJECT_PATH/utils/"

echo "Copying assets..."
cp -r public/assets "$PROJECT_PATH/public/" 2>/dev/null || echo "No assets to copy (you'll need to add your font file manually)"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Make sure BugrinoTrials-Light.otf is in $PROJECT_PATH/public/assets/"
echo "2. Use the component in your pages:"
echo "   <template>"
echo "     <ClientOnly>"
echo "       <ReactionDiffusion />"
echo "     </ClientOnly>"
echo "   </template>"
echo ""
echo "See README.md for customization options."
