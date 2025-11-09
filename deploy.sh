#!/bin/bash
set -e

# === CONFIGURATION ===
PROJECT_ID="etherna-assessment"
REGION="us-central1"
SERVICE_API="fastify-server"
SERVICE_WORKER="bullmq-worker"
DB_INSTANCE="orders-db"
REDIS_INSTANCE="orders-redis"
REPO_NAME="node-repo"
DB_PASSWORD="1234567"

echo "🚀 Starting GCP deployment for project: $PROJECT_ID"

# === PROJECT SETUP ===
echo "⚙️  Setting up project and enabling services..."
echo "✅ Project $PROJECT_ID already exists — skipping creation."
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com redis.googleapis.com --quiet

# === ARTIFACT REGISTRY ===
echo "📦 Creating Artifact Registry..."
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION --quiet || true

# === BUILD DOCKER IMAGE ===
echo "🔧 Building Docker image..."
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_API .

# === CREATE CLOUD SQL (POSTGRES) ===
echo "🗄️  Creating Cloud SQL (Postgres)..."
gcloud sql instances create $DB_INSTANCE \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION --quiet || true

gcloud sql users set-password postgres \
  --instance=$DB_INSTANCE \
  --password=$DB_PASSWORD

# Build connection string
DB_CONNECTION="postgres://postgres:$DB_PASSWORD@/orders_db?host=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE"
echo "DATABASE_URL: $DB_CONNECTION"

# === CREATE REDIS INSTANCE ===
echo "🔴 Creating Redis (Cloud Memorystore)..."
gcloud redis instances create $REDIS_INSTANCE \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_7_0 --quiet || true

REDIS_HOST=$(gcloud redis instances describe $REDIS_INSTANCE --region=$REGION --format='get(host)')
REDIS_PORT=$(gcloud redis instances describe $REDIS_INSTANCE --region=$REGION --format='get(port)')
echo "Redis at $REDIS_HOST:$REDIS_PORT"

# === DEPLOY FASTIFY API ===
echo "🚀 Deploying Fastify API..."
gcloud run deploy $SERVICE_API \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_API \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE \
  --set-env-vars DATABASE_URL="$DB_CONNECTION",REDIS_HOST="$REDIS_HOST",REDIS_PORT="$REDIS_PORT" \
  --cpu 1 --memory 512Mi --timeout 300s

# === DEPLOY BULLMQ WORKER ===
echo "⚙️  Deploying BullMQ Worker..."
gcloud run deploy $SERVICE_WORKER \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_API \
  --region $REGION \
  --platform managed \
  --no-allow-unauthenticated \
  --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE \
  --set-env-vars DATABASE_URL="$DB_CONNECTION",REDIS_HOST="$REDIS_HOST",REDIS_PORT="$REDIS_PORT" \
  --command "npm" \
  --args "run","worker" \
  --cpu 1 --memory 512Mi --timeout 300s

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌐 API URL: $(gcloud run services describe $SERVICE_API --region $REGION --format='get(status.url)')"
echo "⚙️ Worker service deployed successfully."
