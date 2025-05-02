FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Install MongoDB tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y mongodb-clients \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*
