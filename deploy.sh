#!/bin/bash

# ENHANCED DEPLOYMENT SCRIPT
# Combines direct-deploy.sh with all fixes from fix-asset-paths.js, fix-css-path.js, and final-deploy-fix.sh
# This script will:
# 1. Build all projects
# 2. Fix asset paths before deployment
# 3. Deploy with correct content types
# 4. Verify assets after deployment
# 5. Create an enhanced index.html with fallbacks

# Define deployment type (default: s3)
DEPLOY_TYPE=${1:-"s3"}

# Function to update CloudFront error pages
setup_cloudfront_error_pages() {
  echo "🔧 Setting up CloudFront error pages for different paths..."
  
  # Get current CloudFront configuration
  echo "Getting current CloudFront configuration..."
  aws cloudfront get-distribution-config --id E3T7VX6HV95Q5O > cloudfront-config-original.json
  
  # Extract ETag (required for update)
  ETAG=$(grep -o '"ETag": "[^"]*' cloudfront-config-original.json | cut -d'"' -f4)
  
  # Create new config file without the ETag
  cat cloudfront-config-original.json | grep -v '"ETag":' > cloudfront-config-modified.json
  
  # Create a JSON file with the error responses
  cat > cloudfront-error-responses.json << 'EOF'
{
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 10
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/defense/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 10,
        "PathPattern": "/defense/*"
      }
    ]
  }
}
EOF
  
  # Merge the error responses with the existing config if jq is available
  if command -v jq >/dev/null 2>&1; then
    echo "Using jq to update CloudFront configuration..."
    jq -s '.[0].DistributionConfig.CustomErrorResponses = .[1].CustomErrorResponses | .[0]' cloudfront-config-modified.json cloudfront-error-responses.json > cloudfront-config-updated.json
    
    # Update the CloudFront distribution
    echo "Updating CloudFront distribution with new error page configuration..."
    aws cloudfront update-distribution --id E3T7VX6HV95Q5O --if-match "$ETAG" --cli-input-json file://cloudfront-config-updated.json
  else
    echo "⚠️ jq not found. Please install jq or manually update CloudFront error pages in the AWS console."
  fi
  
  # Clean up temporary files
  rm -f cloudfront-config-original.json cloudfront-config-modified.json cloudfront-config-updated.json cloudfront-error-responses.json
}

# Build the projects
echo "🏗️ Building version selector project..."
npm run build

echo "🏗️ Building defense frontend..."
cd ../frontend_defense
npm run build
cd ../version_selector

echo "🏗️ Building commercial frontend..."
cd ../frontend_commercial
npm run build
cd ../version_selector

# Remove node_modules directory if it exists in the dist folder
echo "🧹 Cleaning up build artifacts..."
find dist -type d -name "node_modules" -exec rm -rf {} +

# Create defense and commercial directories in dist if they don't exist
echo "📁 Creating application directories..."
mkdir -p dist/defense
mkdir -p dist/commercial 

# Copy defense frontend build to dist/defense
echo "📋 Copying defense frontend build..."
cp -r ../frontend_defense/dist/client/* dist/defense/

# Copy commercial frontend build to dist/commercial
echo "📋 Copying commercial frontend build..."
cp -r ../frontend_commercial/dist/client/* dist/commercial/

# ===== PATH FIXING SECTION =====
echo "🔧 Fixing asset paths in index.html before deployment..."

# Fix the main index.html to use correct asset paths
if [ -f "dist/public/index.html" ]; then
  echo "📝 Correcting paths in index.html..."
  sed 's/\/public\/assets\//\/assets\//g' dist/public/index.html > fixed-index.html
  
  # Create enhanced index.html with fallbacks
  echo "🔧 Creating enhanced index.html with preload hints and fallbacks..."
  
  # Find the actual CSS and JS file names
  CSS_FILENAME=$(grep -o 'href="[^"]*\.css"' fixed-index.html | head -1 | sed 's/href="\/assets\///;s/"$//')
  JS_FILENAME=$(grep -o 'src="[^"]*\.js"' fixed-index.html | head -1 | sed 's/src="\/assets\///;s/"$//')
  
  if [ -z "$CSS_FILENAME" ] || [ -z "$JS_FILENAME" ]; then
    echo "⚠️ Warning: Couldn't detect CSS or JS filename from index.html"
    # Use fixed-index.html as is
    cp fixed-index.html enhanced-index.html
  else
    echo "Found asset references: CSS=$CSS_FILENAME, JS=$JS_FILENAME"
    
    cat > enhanced-index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hand Receipt</title>
  
  <!-- Preload critical assets -->
  <link rel="preload" href="/assets/$CSS_FILENAME" as="style">
  <link rel="preload" href="/assets/$JS_FILENAME" as="script">
  
  <!-- Load CSS with alternate approach -->
  <link rel="stylesheet" href="/assets/$CSS_FILENAME?v=1">
  
  <!-- Fallback CSS if main doesn't load -->
  <style>
    /* Minimal styling in case the CSS doesn't load */
    body {
      font-family: Arial, sans-serif;
      background-color: #000;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    h1 {
      font-size: 48px;
      margin-bottom: 40px;
    }
    .version-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 250px;
    }
    .version-option {
      background-color: #333;
      color: white;
      padding: 15px 25px;
      border-radius: 4px;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 18px;
      transition: background-color 0.2s;
    }
    .version-option:hover {
      background-color: #444;
    }
    .email {
      margin-top: 40px;
      font-size: 18px;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <!-- Fallback content -->
  <div id="fallback" style="display:none">
    <h1>HandReceipt</h1>
    <div class="version-options">
      <a href="/defense/" class="version-option">
        Defense <span>→</span>
      </a>
      <a href="/commercial/" class="version-option">
        Commercial <span>→</span>
      </a>
      <a href="/pitch/" class="version-option">
        Pitch Deck <span>→</span>
      </a>
    </div>
    <div class="email">toole.brendan@gmail.com</div>
  </div>
  
  <script>
    // Show fallback content if the main app doesn't load in 2 seconds
    setTimeout(function() {
      if (document.getElementById('root').children.length === 0) {
        document.getElementById('fallback').style.display = 'block';
      }
    }, 2000);
  </script>
  
  <script type="module" src="/assets/$JS_FILENAME"></script>
</body>
</html>
EOF
  fi
else
  echo "⚠️ Warning: dist/public/index.html not found"
fi

# ===== DEPLOYMENT SECTION =====
case $DEPLOY_TYPE in
  "s3")
    echo "📤 Deploying to AWS S3..."
    
    # Upload JavaScript files with correct content type
    echo "🔧 Uploading JavaScript files with correct content type..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --delete \
      --include "*.js" \
      --content-type "application/javascript" \
      --cache-control "max-age=31536000,public"
    
    # Upload JS map files with correct content type
    echo "🔧 Uploading JS map files with correct content type..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --include "*.js.map" \
      --content-type "application/json" \
      --cache-control "max-age=31536000,public"
    
    # Upload CSS files with correct content type
    echo "🔧 Uploading CSS files with correct content type..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --include "*.css" \
      --content-type "text/css" \
      --cache-control "max-age=31536000,public"
    
    # Upload font files with correct content type
    echo "🔧 Uploading font files with correct content type..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --include "*.woff2" \
      --content-type "font/woff2" \
      --cache-control "max-age=31536000,public"
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --include "*.woff" \
      --content-type "font/woff" \
      --cache-control "max-age=31536000,public"
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --include "*.ttf" \
      --content-type "font/ttf" \
      --cache-control "max-age=31536000,public"
    
    # Upload HTML files with correct content type and no-cache
    echo "🔧 Uploading HTML files with correct content type and no-cache..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --include "*.html" \
      --content-type "text/html" \
      --cache-control "no-cache"
    
    # Upload all remaining files (images, etc.)
    echo "🔧 Uploading all other files..."
    aws s3 sync dist/ s3://www.handreceipt.com/ \
      --delete \
      --exclude "*.js" \
      --exclude "*.js.map" \
      --exclude "*.css" \
      --exclude "*.html" \
      --exclude "*.woff" \
      --exclude "*.woff2" \
      --exclude "*.ttf" \
      --cache-control "max-age=31536000,public"
    
    # Upload the enhanced index.html
    echo "📤 Uploading enhanced index.html..."
    aws s3 cp enhanced-index.html s3://www.handreceipt.com/index.html --content-type "text/html" --cache-control "no-cache"
    
    # ===== POST-DEPLOYMENT VERIFICATION =====
    echo "🔍 Verifying critical assets..."
    
    # Find the CSS filename again for verification
    if [ -n "$CSS_FILENAME" ]; then
      echo "✓ Re-enforcing CSS content type..."
      aws s3 cp s3://www.handreceipt.com/assets/$CSS_FILENAME s3://www.handreceipt.com/assets/$CSS_FILENAME \
        --content-type "text/css" --metadata-directive REPLACE --cache-control "max-age=31536000,public"
    fi
    
    # Find the JS filename again for verification
    if [ -n "$JS_FILENAME" ]; then
      echo "✓ Re-enforcing JS content type..."
      aws s3 cp s3://www.handreceipt.com/assets/$JS_FILENAME s3://www.handreceipt.com/assets/$JS_FILENAME \
        --content-type "application/javascript" --metadata-directive REPLACE --cache-control "max-age=31536000,public"
    fi
    
    # Set up CloudFront error pages
    setup_cloudfront_error_pages
    
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
    # Create deployment zip from dist directory
    zip -r "$ARCHIVE_NAME" dist
    echo "✅ Created deployment archive: $ARCHIVE_NAME"
    ;;
    
  "local")
    echo "🖥️ Preparing for local deployment..."
    # This option just builds the project
    echo "✅ Build complete! Deploy the 'dist' directory to your server."
    ;;
    
  *)
    echo "❌ Unknown deployment type: $DEPLOY_TYPE"
    echo "Available options: s3, archive, local"
    exit 1
    ;;
esac

# Clean up temporary files
rm -f fixed-index.html enhanced-index.html

echo "✅ Deployment complete!"
echo "⏳ Note: CloudFront distribution updates may take 5-15 minutes to fully deploy"
echo "   Check status with: aws cloudfront get-distribution --id E3T7VX6HV95Q5O"
