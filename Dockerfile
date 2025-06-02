FROM node:18-alpine

# Create non-root user and set up proper permissions
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    mkdir -p /app && \
    chown -R appuser:appgroup /app

WORKDIR /app

# Copy package files first for better layer caching
COPY --chown=appuser:appgroup package*.json ./

# Install dependencies including devDependencies
RUN npm install --include=dev --unsafe-perm && \
    npm install -g typescript && \
    npm cache clean --force

# Copy application files with proper permissions
COPY --chown=appuser:appgroup . .
RUN chmod +x ./node_modules/.bin/tsc
# Switch to non-root user
USER appuser

# Verify files are accessible
RUN ls -la && \
    npm run build

EXPOSE 3000
CMD ["npm", "start"]