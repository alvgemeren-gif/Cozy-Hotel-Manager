FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=prod

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Install build dependencies
RUN npm ci

# Build
RUN npm run build

# Remove build dependencies
RUN npm ci --only=prod

# Expose port
EXPOSE 3000

# Start
CMD ["node", "dist/index.mjs"]
