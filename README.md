# HandReceipt Version Selector

This project serves as the main landing page and version selector for the HandReceipt application, allowing users to choose between Defense, Commercial, and Pitch Deck versions.

## Deployment Guide

### Standard Deployment

To deploy the version selector along with proper routing to Defense and Commercial applications:

```bash
# Make sure deployment scripts are executable
chmod +x deploy.sh
chmod +x deploy-with-fixes.sh
chmod +x post-build-check.sh

# Run the enhanced deployment script
./deploy-with-fixes.sh
```

This script:
1. Builds the version selector project
2. Runs checks for potential JS module issues
3. Fixes paths and MIME types
4. Sets up routing redirects
5. Deploys everything to S3
6. Updates MIME types on AWS and invalidates CloudFront cache

### CloudFront Setup for Improved Routing

For optimal routing between applications, set up the included CloudFront function:

1. Open AWS CloudFront console
2. Go to your distribution (E3T7VX6HV95Q5O)
3. Go to "Functions" section
4. Create a new function:
   - Name: `handreceipt-routing`
   - Copy code from `cloudfront-routing-function.js`
5. Publish the function
6. Associate the function with the distribution as a "Viewer Request" event

This improves routing so `/defense` and `/commercial` URLs correctly route to the right applications.

## Project Structure

- `/client` - Version selector frontend code
- `/server` - Backend API endpoints
- `/shared` - Shared types and utilities

## Application Routing

The version selector routes to different applications:

- `/` - Main version selector
- `/defense/` - Defense version (separate application)
- `/commercial/` - Commercial version (separate application)
- `/pitch/` - Pitch deck version

## Troubleshooting

### MIME Type Issues

If JavaScript modules don't load with errors like "Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of 'text/html'":

1. Use the `deploy-with-fixes.sh` script which handles MIME types correctly
2. Double-check S3 content types for JavaScript files with:

```bash
aws s3 ls s3://www.handreceipt.com/ --recursive | grep -i "\.js" | head -10
aws s3api head-object --bucket www.handreceipt.com --key path/to/problem/file.js
```

3. Fix specific files if needed:

```bash
aws s3 cp s3://www.handreceipt.com/public/assets/file.js s3://www.handreceipt.com/public/assets/file.js --content-type "application/javascript" --metadata-directive REPLACE
```

4. Invalidate the CloudFront cache:

```bash
aws cloudfront create-invalidation --distribution-id E3T7VX6HV95Q5O --paths "/*"
```

### Styling Issues

If styles are not applied correctly:
- Make sure CSS files have the correct MIME type (text/css)
- Verify that all paths in the HTML files are correct for your environment
- Check browser console for any CSS loading errors
