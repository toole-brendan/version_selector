# HandReceipt Deployment Guide

This document provides detailed instructions for deploying and maintaining the HandReceipt web application, which consists of a central version selector and three separate frontend applications.

## Project Structure

The HandReceipt application consists of four separate applications:

1. **Version Selector** (this repository): The main landing page that allows users to choose between Defense, Commercial, and Pitch Deck versions.
2. **Defense Frontend**: Located in a separate repository at `../frontend_defense/`
3. **Commercial Frontend**: Located in a separate repository at `../frontend_commercial/`
4. **Pitch Deck**: Located in a separate repository at `../frontend_pitch/`

When deployed to production, these applications are organized in the following directory structure:

```
www.handreceipt.com (CloudFront Distribution)
├── / (root - version_selector project)
│   ├── index.html
│   ├── assets/
├── /defense/
│   ├── index.html (and defense app files)
├── /commercial/
│   ├── index.html (and commercial app files)
└── /pitch/
    ├── index.html (redirect)
    ├── app.html (pitch app content)
```

## Deployment Process

### 1. Building and Deploying the Version Selector

The `enhanced-deploy.sh` script handles building and deploying the version selector application:

```bash
./enhanced-deploy.sh
```

This script:
- Builds the version selector application
- Builds the defense and commercial frontends
- Copies the built files to their respective directories
- Fixes asset paths in HTML files
- Creates an enhanced index.html with fallback content
- Uploads files to S3 with correct content types
- Sets up CloudFront error pages
- Invalidates the CloudFront cache

### 2. Manual Frontend Deployment

Each frontend must be built separately and copied to the appropriate directory structure:

#### Defense Frontend

```bash
# Build the defense frontend
cd ../frontend_defense
npm run build

# Copy to the version_selector/dist directory
mkdir -p ../version_selector/dist/defense
cp -r dist/client/* ../version_selector/dist/defense/

# Ensure proper index.html formatting
echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>HandReceipt - Defense</title><link rel="stylesheet" href="/defense/assets/[css-filename].css"></head><body><div id="root"></div><script type="module" src="/defense/assets/[js-filename].js"></script></body></html>' > ../version_selector/dist/defense/index.html
```

Replace `[css-filename]` and `[js-filename]` with the actual filenames from your build.

#### Commercial Frontend

```bash
# Build the commercial frontend
cd ../frontend_commercial
npm run build

# Copy to the version_selector/dist directory
mkdir -p ../version_selector/dist/commercial
cp -r dist/client/* ../version_selector/dist/commercial/

# Ensure proper index.html formatting
echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>HandReceipt - Commercial</title><link rel="stylesheet" href="/commercial/assets/[css-filename].css"></head><body><div id="root"></div><script type="module" src="/commercial/assets/[js-filename].js"></script></body></html>' > ../version_selector/dist/commercial/index.html
```

#### Pitch Deck

```bash
# Build the pitch deck frontend
cd ../frontend_pitch
npm run build

# Copy to the version_selector/dist directory
mkdir -p ../version_selector/dist/pitch
cp -r dist/* ../version_selector/dist/pitch/

# Create a redirect file
echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=app.html"><title>Redirecting to HandReceipt Pitch Deck</title><style>body{font-family:Arial,sans-serif;background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;}</style></head><body><p>Redirecting to the pitch deck application... <a href="app.html">Click here if you are not redirected automatically</a>.</p></body></html>' > ../version_selector/dist/pitch/index.html

# Copy main app HTML
cp [path-to-pitch-app-html] ../version_selector/dist/pitch/app.html
```

### 3. S3 Deployment

After building all applications, deploy them to S3:

```bash
# Upload JavaScript files with correct content type
aws s3 sync dist/ s3://www.handreceipt.com/ \
  --delete \
  --include "*.js" \
  --content-type "application/javascript" \
  --cache-control "max-age=31536000,public"

# Upload CSS files with correct content type
aws s3 sync dist/ s3://www.handreceipt.com/ \
  --include "*.css" \
  --content-type "text/css" \
  --cache-control "max-age=31536000,public"

# Upload HTML files with correct content type and no-cache
aws s3 sync dist/ s3://www.handreceipt.com/ \
  --include "*.html" \
  --content-type "text/html" \
  --cache-control "no-cache"

# Upload all remaining files
aws s3 sync dist/ s3://www.handreceipt.com/ \
  --delete \
  --exclude "*.js" \
  --exclude "*.css" \
  --exclude "*.html" \
  --cache-control "max-age=31536000,public"
```

### 4. CloudFront Invalidation

After uploading files to S3, invalidate the CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id E3T7VX6HV95Q5O \
  --paths "/*"
```

## Routing Strategy

### Version Selector Routing

The version selector uses a combination of client-side and server-side routing:

1. **Root Application**: The version selector app at `/` uses React with wouter for internal routing
2. **Defense & Commercial Routes**: Uses direct URL navigation to `/defense/` and `/commercial/` directories
3. **Pitch Route**: Uses direct URL navigation to `/pitch/` which redirects to `/pitch/app.html`

### HTML File Setup

Each application directory should have its own index.html file with proper references to its assets:

1. **Root index.html**: 
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Hand Receipt</title>
     <link rel="stylesheet" href="/assets/index-[hash].css">
   </head>
   <body>
     <div id="root"></div>
     <script type="module" src="/assets/index-[hash].js"></script>
   </body>
   </html>
   ```

2. **Defense index.html**:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>HandReceipt - Defense</title>
     <link rel="stylesheet" href="/defense/assets/index-[hash].css">
   </head>
   <body>
     <div id="root"></div>
     <script type="module" src="/defense/assets/index-[hash].js"></script>
   </body>
   </html>
   ```

3. **Commercial index.html**: Similar to Defense

4. **Pitch index.html**: Redirects to app.html
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta http-equiv="refresh" content="0;url=app.html">
     <title>Redirecting to HandReceipt Pitch Deck</title>
   </head>
   <body>
     <p>Redirecting to the pitch deck application... <a href="app.html">Click here if not redirected</a>.</p>
   </body>
   </html>
   ```

## CloudFront Configuration

### Error Pages

CloudFront should be configured to handle 404 errors by returning the index.html file:

```json
{
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 10
      }
    ]
  }
}
```

### Cache Behaviors

Set up different cache behaviors for different paths:

```json
{
  "CacheBehaviors": {
    "Quantity": 3,
    "Items": [
      {
        "PathPattern": "/defense/*",
        "TargetOriginId": "S3-handreceipt-frontend",
        "ViewerProtocolPolicy": "redirect-to-https",
        ...
      },
      {
        "PathPattern": "/commercial/*",
        ...
      },
      {
        "PathPattern": "/pitch/*",
        ...
      }
    ]
  }
}
```

## Troubleshooting Common Issues

### 1. Content Type Issues

If files are displayed as raw HTML or text, check the content type:

```bash
# Check content type of a file
aws s3api head-object --bucket www.handreceipt.com --key path/to/file.html

# Fix content type
aws s3 cp s3://www.handreceipt.com/path/to/file.html s3://www.handreceipt.com/path/to/file.html \
  --content-type "text/html" --metadata-directive REPLACE
```

### 2. Path Issues

If assets aren't loading, check the paths in HTML files:

- Development often uses `/public/assets/` paths
- Production should use `/assets/` paths

Fix with:

```bash
# Fix paths in index.html
sed 's/\/public\/assets\//\/assets\//g' index.html > fixed-index.html
```

### 3. CloudFront Caching

If changes aren't visible, invalidate the CloudFront cache:

```bash
aws cloudfront create-invalidation --distribution-id E3T7VX6HV95Q5O --paths "/*"
```

Remember that invalidations can take 5-15 minutes to fully propagate.

## Maintenance Tasks

### 1. Regular Deployments

For routine updates:

1. Build the version selector: `npm run build`
2. Build each frontend application
3. Upload to S3 with correct content types
4. Invalidate CloudFront cache

### 2. Asset Management

For optimal performance:

- Set long cache times for static assets (JS, CSS, images)
- Set no-cache for HTML files to ensure latest content
- Use hashed filenames for assets to bust cache when content changes

### 3. Monitoring

Regularly monitor:

- CloudFront distribution status
- S3 bucket permissions
- Error rates in CloudWatch
- Access logs for unusual patterns

## Conclusion

This deployment strategy ensures that all four applications work together seamlessly while maintaining separation of concerns. The version selector provides a unified entry point, and each application maintains its own routing and state.

By following these guidelines, you can maintain a robust, scalable multi-application setup that provides a smooth user experience across different versions of HandReceipt. 