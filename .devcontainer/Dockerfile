FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache \
    git \
    openssh \
    openssl \
    libc6-compat

# Install Bun
RUN npm install -g bun

# Install global tools
RUN npm install -g typescript prisma

# Set up workspace
WORKDIR /workspace

# Keep container running
CMD ["sleep", "infinity"]
