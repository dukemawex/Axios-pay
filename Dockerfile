
# Stage 1: Build
FROM node:20-slim AS builder

# Install OpenSSL (Required by Prisma on Debian/Slim)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Install all dependencies including dev
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-slim

# Install OpenSSL for the runtime environment
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Copy generated Prisma client and build artifacts from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["npm", "run", "start"]