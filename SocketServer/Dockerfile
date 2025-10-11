# ---- Base image ----
FROM oven/bun:latest

# ---- Set working directory ----
WORKDIR /app

# ---- Copy package files ----
COPY package.json bun.lock* ./

# ---- Install dependencies ----
RUN bun install --frozen-lockfile

# ---- Copy the rest of the app ----
COPY . .

# ---- Run the server ----
CMD ["bun", "run", "index.js"]
