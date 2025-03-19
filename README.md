# HandReceipt Version Selector

This repository contains the version selector application for HandReceipt, which allows users to choose between different versions of the application:

- Defense
- Commercial 
- Pitch Deck

## Project Overview

The version selector serves as the entry point to the HandReceipt application ecosystem. It provides a simple interface for users to select which version of the application they want to use, and then redirects them to the appropriate application.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

- `client/`: Frontend React application
  - `src/`: Source code
    - `components/`: React components
    - `pages/`: Application pages
- `server/`: Express server for development and production
- `dist/`: Build output directory
- `docs/`: Documentation

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

Key features of the deployment process:

1. **Multiple Applications**: This project integrates with three separate frontend applications
2. **AWS Infrastructure**: Uses S3 for storage and CloudFront for distribution
3. **Enhanced Deployment**: The `enhanced-deploy.sh` script automates most of the deployment process

## CloudFront Structure

The application is deployed to CloudFront with the following path structure:

```
www.handreceipt.com/          # Version selector (this repository)
www.handreceipt.com/defense/  # Defense application
www.handreceipt.com/commercial/ # Commercial application
www.handreceipt.com/pitch/    # Pitch deck application
```

## Troubleshooting

If you encounter issues with the deployment, please check the [Troubleshooting section in DEPLOYMENT.md](./docs/DEPLOYMENT.md#troubleshooting-common-issues).
