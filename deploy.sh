#!/bin/bash

# Configuration settings (can be overridden by environment variables)
export DEFAULT_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID:-""}
export DEFAULT_REGION=${GOOGLE_CLOUD_LOCATION:-"us-central1"}
export SERVICE_NAME="iab-resizer-service"

echo "=== Deploying Image Resizer to Google Cloud Run ==="

if [ -z "$DEFAULT_PROJECT_ID" ]; then
    read -p "Enter your Google Cloud Project ID: " GOOGLE_CLOUD_PROJECT_ID
else
    read -p "Enter your Google Cloud Project ID [$DEFAULT_PROJECT_ID]: " input
    GOOGLE_CLOUD_PROJECT_ID=${input:-$DEFAULT_PROJECT_ID}
fi

read -p "Enter the Google Cloud Region [$DEFAULT_REGION]: " input
GOOGLE_CLOUD_LOCATION=${input:-$DEFAULT_REGION}

read -p "Enter the base API key to protect your service (press enter to generate one randomly): " API_KEY

if [ -z "$API_KEY" ]; then
    API_KEY=$(openssl rand -hex 16)
    echo "Generated Random API Key: $API_KEY"
    echo "SAVE THIS! You will need it to use the service."
else
    echo "Using provided API Key."
fi

echo ""
echo "Deploying to project: $GOOGLE_CLOUD_PROJECT_ID"
echo "Region: $GOOGLE_CLOUD_LOCATION"
echo "Deploying service setup... please wait as the image is built and uploaded."
echo ""

# Enable required APIs just in case
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com \
    --project="$GOOGLE_CLOUD_PROJECT_ID"

# Build and Deploy
gcloud run deploy $SERVICE_NAME \
    --source . \
    --project="$GOOGLE_CLOUD_PROJECT_ID" \
    --region="$GOOGLE_CLOUD_LOCATION" \
    --allow-unauthenticated \
    --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$GOOGLE_CLOUD_PROJECT_ID,GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION,RESIZE_API_KEY=$API_KEY"

echo "Deployment complete! Visit your Service URL to use the application."
