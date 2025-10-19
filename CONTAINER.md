# Running the server in Docker

This repo includes a minimal Dockerfile and docker-compose to run the `server/` service.

Quick steps:

1. Copy the example env file and fill any secrets you need:

    ```bash
    cp .env.example .env
    # edit .env and set ADMIN_TOKEN at minimum
    ```

2. Build and run with Docker Compose:

    ```bash
    docker compose up --build
    ```

3. Verify the server health endpoint:

    ```bash
    curl http://localhost:3000/health
    ```

Notes:

- The container exposes port 3000 by default. Map it as you prefer in `docker-compose.yml`.
- For production images, consider running `npm ci --only=production` and pinning node base image versions.
