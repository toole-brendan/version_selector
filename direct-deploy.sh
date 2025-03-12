#!/bin/bash

# This script follows the exact pattern from the working deploy-pitch.sh script
# Define deployment type (default: s3)
DEPLOY_TYPE=${1:-"s3"}

# Build the project
echo "🏗️ Building version selector project..."
npm run build

# Build the defense frontend
echo "🏗️ Building defense frontend..."
cd ../frontend_defense
npm run build
cd ../version_selector

# Build the commercial frontend
echo "🏗️ Building commercial frontend..."
cd ../frontend_commercial
npm run build
cd ../version_selector

# Remove node_modules directory if it exists in the dist folder
echo "🧹 Checking for and removing any node_modules directories..."
find dist -type d -name "node_modules" -exec rm -rf {} +

# Create defense and commercial directories in dist if they don't exist
echo "📁 Creating application directories..."
mkdir -p dist/defense
mkdir -p dist/commercial 

# Copy defense frontend build to dist/defense
echo "📋 Copying defense frontend build..."
cp -r ../frontend_defense/dist/* dist/defense/

# Copy commercial frontend build to dist/commercial
echo "📋 Copying commercial frontend build..."
cp -r ../frontend_commercial/dist/* dist/commercial/

# Create simple redirects for defense and commercial - USING THE SAME APPROACH AS deploy-pitch.sh
echo "📝 Creating simple HTML redirects..."

# Create redirect for defense
cat > dist/defense/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=public/index.html">
  <title>Redirecting to HandReceipt Defense</title>
</head>
<body>
  <p>If you are not redirected automatically, follow this <a href="public/index.html">link to the defense application</a>.</p>
</body>
</html>
EOF

# Create redirect for commercial
cat > dist/commercial/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=public/index.html">
  <title>Redirecting to HandReceipt Commercial</title>
</head>
<body>
  <p>If you are not redirected automatically, follow this <a href="public/index.html">link to the commercial application</a>.</p>
</body>
</html>
EOF

# Use the EXACT SAME S3 UPLOAD APPROACH from deploy-pitch.sh
case $DEPLOY_TYPE in
  "s3")
    echo "📤 Deploying to AWS S3..."
    
    # Upload JS files first with correct content type - EXACTLY like deploy-pitch.sh
    echo "🔧 Uploading JavaScript files with correct content type..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --delete \
      --cache-control "max-age=31536000,public" \
      --exclude "*.html" \
      --content-type "application/javascript" \
      --include "*.js"
    
    # Upload all files except HTML and JS with long cache duration - EXACTLY like deploy-pitch.sh
    echo "🔧 Uploading non-HTML/non-JS files..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --delete \
      --cache-control "max-age=31536000,public" \
      --exclude "*.html" \
      --exclude "*.js"
    
    # Upload HTML files with no-cache - EXACTLY like deploy-pitch.sh
    echo "🔧 Uploading HTML files with no-cache..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --delete \
      --cache-control "no-cache" \
      --include "*.html"
    
    # Ensure JS map files have the correct content type - EXACTLY like deploy-pitch.sh
    echo "🔧 Setting correct content type for JS map files..."
    aws s3 cp s3://www.handreceipt.com/ s3://www.handreceipt.com/ \
      --exclude "*" \
      --include "*.js.map" \
      --content-type "application/json" \
      --metadata-directive REPLACE \
      --recursive
    
    # Invalidate CloudFront cache
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
      --distribution-id E3T7VX6HV95Q5O \
      --paths "/*"
    ;;
    
  "archive")
    echo "📦 Creating deployment archive..."
    # Create a deployment archive without node_modules
    ARCHIVE_NAME="deployment-$(date +%Y%m%d-%H%M%S).zip"
    
    # Create deployment zip from dist directory (which already excludes node_modules)
    zip -r "$ARCHIVE_NAME" dist
    
    echo "✅ Created deployment archive: $ARCHIVE_NAME"
    ;;
    
  "local")
    echo "🖥️ Preparing for local deployment..."
    # This option just builds the project and ensures node_modules is not in dist
    echo "✅ Build complete! Deploy the 'dist' directory to your server."
    ;;
    
  *)
    echo "❌ Unknown deployment type: $DEPLOY_TYPE"
    echo "Available options: s3, archive, local"
    exit 1
    ;;
esac

echo "✅ Deployment preparation complete!"
