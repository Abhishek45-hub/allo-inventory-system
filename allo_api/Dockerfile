FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package manifests and Prisma schema for cached installs
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install build deps
RUN npm ci --silent

# Copy the rest of the sources
COPY . .

# Generate Prisma client and build TypeScript
RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production
EXPOSE 5055

CMD ["node", "dist/server.js"]
