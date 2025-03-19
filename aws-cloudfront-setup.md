# HandReceipt.com AWS CloudFront Setup Guide

This guide will help you set up your website structure with AWS S3 and CloudFront for `www.handreceipt.com`.

## Website Structure

```
www.handreceipt.com (CloudFront Distribution)
├── / (root - version_selector project)
│   ├── index.html (and other root files)  
├── /defense (frontend_defense project)
│   ├── index.html (and other defense app files)
├── /commercial (frontend_commercial)
│   ├── index.html (and other commercial app files)
└── /pitch
    ├── index.html (and other pitch app files)
```

## 1. S3 Bucket Setup

### Create or Configure S3 Bucket

If you haven't created your S3 bucket yet:

```bash
aws s3 mb s3://www.handreceipt.com
```

Enable static website hosting:

```bash
aws s3 website s3://www.handreceipt.com/ --index-document index.html --error-document index.html
```

### Set Bucket Policy for Public Access

Create a bucket policy file (bucket-policy.json):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::www.handreceipt.com/*"
    }
  ]
}
```

Apply the bucket policy:

```bash
aws s3api put-bucket-policy --bucket www.handreceipt.com --policy file://bucket-policy.json
```

## 2. CloudFront Distribution Setup

### Create CloudFront Distribution

You can create the CloudFront distribution using the AWS console or CLI:

Using CLI with our configuration file:

```bash
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Important CloudFront Settings:

1. **Origin Settings**:
   - Origin Domain: Your S3 website endpoint (not the S3 bucket endpoint)
   - Origin Path: Leave empty for root
   - Origin Protocol Policy: HTTP Only (for S3 website endpoints)

2. **Cache Behavior Settings**:
   - Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS
   - Cache based on selected request headers: None
   - Object caching: Use origin cache headers

3. **Distribution Settings**:
   - Price Class: Use only US, Canada and Europe (or choose based on your audience)
   - Custom SSL Certificate: Select your ACM certificate for handreceipt.com
   - Default Root Object: index.html

4. **Error Pages**:
   - HTTP Error Code: 403 → /index.html → 200
   - HTTP Error Code: 404 → /index.html → 200

## 3. DNS Configuration (Route 53 or your DNS provider)

1. Create an A record for `www.handreceipt.com` pointing to your CloudFront distribution
2. Create a CNAME record for `handreceipt.com` pointing to `www.handreceipt.com`

Example Route 53 configuration:

```bash
aws route53 change-resource-record-sets --hosted-zone-id YOUR_HOSTED_ZONE_ID --change-batch '{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.handreceipt.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "YOUR_CLOUDFRONT_DOMAIN_NAME.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "handreceipt.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "YOUR_CLOUDFRONT_DOMAIN_NAME.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}'
```

## 4. SSL Certificate (ACM)

If you haven't already, request an SSL certificate for your domain:

```bash
aws acm request-certificate \
  --domain-name handreceipt.com \
  --validation-method DNS \
  --subject-alternative-names www.handreceipt.com
```

Follow the validation process, then update your CloudFront distribution to use this certificate.

## 5. Deployment Process

1. Build each project individually
2. Deploy them to their respective folders in the S3 bucket
3. Invalidate the CloudFront cache

You can use the provided `deploy.sh` script to automate this process.

## 6. Testing Your Setup

After deployment, test that all your routes work properly:

- `https://www.handreceipt.com/` should show the version selector
- `https://www.handreceipt.com/defense/` should show the defense app
- `https://www.handreceipt.com/commercial/` should show the commercial app
- `https://www.handreceipt.com/pitch/` should show the pitch app

## 7. Troubleshooting

- If you see 403 errors, check your bucket policy
- If CSS/JS doesn't load, check the Content-Type headers
- If routes don't work, verify the error page settings in CloudFront
- If you see certificate warnings, ensure your SSL certificate is correctly associated with your CloudFront distribution 