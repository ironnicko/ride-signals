# Base image
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# ------------------------
# Install dependencies
# ------------------------
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ------------------------
# Build app
# ------------------------
FROM base AS build
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
RUN bun run build

# ------------------------
# Production image
# ------------------------
FROM base AS release
WORKDIR /usr/src/app

# Copy production deps
COPY --from=install /usr/src/app/node_modules ./node_modules

# Copy build and public folders
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
COPY package.json bun.lock ./

# Run as non-root
USER bun

CMD ["bun", "run", "start"]
