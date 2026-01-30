# Deployment

## Google Cloud Run

Three services deployed via `cloudbuild.yaml`:

| Service | Dockerfile | Public | Cloud SQL | Notes |
|---------|------------|--------|-----------|-------|
| observing-appview | packages/observing-appview/Dockerfile | Yes | Yes | Main API + serves frontend |
| observing-ingester | packages/observing-ingester/Dockerfile | Yes | Yes | min-instances=1 (always running) |
| observing-media-proxy | packages/observing-media-proxy/Dockerfile | Yes | No | Stateless image cache |

## Manual Deploy

```bash
gcloud builds submit --config cloudbuild.yaml
```

Builds run in parallel (`waitFor: ['-']`), then push, then deploy.

## Automatic Deploy

Push to `main` triggers deployment after CI checks pass. See `.github/workflows/deploy.yml`.

## Environment Variables

### Database (appview, ingester)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/observing

# Or for Cloud SQL:
DB_HOST=/cloudsql/project:region:instance
DB_NAME=observing
DB_USER=postgres
DB_PASSWORD=...
```

### Ingester

```bash
RELAY_URL=wss://bsky.network
```

### Media Proxy

```bash
MEDIA_PROXY_PORT=3001
CACHE_DIR=./cache/media
```

### AppView

```bash
PORT=3000
PUBLIC_URL=https://your-domain.run.app
```
