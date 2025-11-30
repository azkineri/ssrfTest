# Dev Container Setup

This project includes a VS Code Dev Container configuration for easy development.

## Prerequisites
- Visual Studio Code
- Docker Desktop
- Dev Containers extension (`ms-vscode-remote.remote-containers`)

## Getting Started

1. Open this folder in VS Code
2. Press `F1` and select "Dev Containers: Reopen in Container"
3. Wait for the container to build and start
4. The development server will start automatically on port 3000

## What's Included
- Node.js 20
- Bun runtime
- TypeScript
- Prisma CLI
- Pre-configured VS Code extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
  - Docker

## Database
The SQLite database (`dev.db`) is created automatically when the container starts.

## Environment Variables
Make sure your `.env` file is present in the root directory before opening the dev container.
