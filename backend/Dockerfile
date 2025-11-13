FROM node:20-alpine

WORKDIR /app

# Install curl for health checks and ffmpeg for audio extraction
RUN apk add --no-cache curl ffmpeg

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --only=production && npm remove sqlite3

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "start"]