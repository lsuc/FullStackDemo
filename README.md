# Lireddit

A full-stack Reddit-like application built with React, Next.js, GraphQL, PostgreSQL, Redis, and TypeScript.

## Project Structure

The project consists of two applications:

- **server/** – GraphQL API, authentication, database, Redis
- **web/** – Next.js frontend

## Technologies

### Backend
- Node.js
- TypeScript
- GraphQL
- PostgreSQL
- TypeORM
- Redis

### Frontend
- React
- Next.js
- Chakra UI
- URQL
- TypeScript

## Prerequisites

Before running the project, make sure you have:

- Node.js
- PostgreSQL
- Redis
- npm

### Windows

This project uses Redis for session storage.
Redis runs through WSL, so make sure WSL is running before starting the server.

### Install Redis (Ubuntu)

Follow the official Redis installation instructions for Ubuntu.

## Running the Project

### 1. Install dependencies

In both `server` and `web`:

```bash
npm install
```

### 2. Start the backend

In the `server` directory:

Start TypeScript compilation in watch mode:

```bash
npm run watch
```

In another terminal, start the development server:

```bash
npm run dev
```

### 3. Start the frontend

In the `web` directory:

```bash
npm run dev
```

### 4. Regenerate GraphQL types

Whenever the GraphQL schema changes, regenerate the frontend types:

```bash
npm run codegen
```

## Development Workflow

1. Start PostgreSQL.
2. Start Redis (via WSL on Windows).
3. In `server/`:
   - `npm run watch`
   - `npm run dev`
4. In `web/`:
   - `npm run dev`
5. If you change the GraphQL schema:
   - `npm run codegen`

## Features

- User authentication
- Create, edit and delete posts
- Upvote/downvote posts
- Cursor-based pagination
- GraphQL API
- Server-side rendering with Next.js
