### Builder stage: install dependencies
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Copy package files and install production deps only (faster, reproducible)
COPY server/package*.json ./
RUN npm ci --only=production --silent --no-audit --no-fund || npm install --production --silent --no-audit --no-fund

# Copy app source
COPY server/ ./

### Runtime stage: smaller image
FROM node:18-alpine AS runtime
WORKDIR /usr/src/app

# Copy only production node_modules and app code from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .

EXPOSE 3000

CMD ["node", "index.js"]
