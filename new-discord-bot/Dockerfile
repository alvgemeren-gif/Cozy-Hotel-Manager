FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

# Remove build dependencies
RUN npm ci --only=prod

# Expose port
EXPOSE 3000

# Start
CMD ["node", "dist/index.mjs"]
