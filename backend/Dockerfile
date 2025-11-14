# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN set -eux; \
    if npm ci --omit=dev; then \
      echo "Installed dependencies with npm ci --omit=dev"; \
    else \
      echo "'npm ci --omit=dev' no soportado, usando npm ci --production"; \
      npm ci --production; \
    fi; \
    mkdir -p node_modules

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
