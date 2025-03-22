# Video Backend with AWS SAM

This is the backend for the food video sharing app, built using AWS SAM (Serverless Application Model). It provides Lambda-based APIs to manage video uploads, conversions, and metadata, with automatic video processing and DynamoDB integration.

---

## Architecture

- **API Gateway** — REST API to handle video listing, deletion, and signed URL generation.
- **AWS Lambda** — Processes S3 triggers and HTTP requests.
- **S3 Buckets** — For storing raw uploads, converted videos, and thumbnails.
- **DynamoDB** — Stores metadata for each uploaded video.
- **FFmpeg Layer** — Converts uploaded videos to MP4 using a Lambda Layer.
  
---

## Features

- Generate pre-signed URLs for secure video & thumbnail uploads.
- Trigger Lambda on new S3 object upload (`uploads/` folder only).
- Convert videos to MP4 and store in `videos/` folder.
- Extract metadata and save thumbnail & video info in DynamoDB.
- REST APIs for fetching and deleting videos.

---

## Deploy

Make sure AWS CLI is configured and `sam` is installed.

```bash
sam build
sam deploy --guided
