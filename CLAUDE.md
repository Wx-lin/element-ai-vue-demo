# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要规则

**所有回复内容都必须使用中文。** 在与用户交流时，请始终使用中文进行回复和解释，包括代码注释、错误信息说明等。

## Project Overview

This is a full-stack AI chat application built with Vue 3 + Element Plus + Element AI Vue (Client) and NestJS (Server). The application demonstrates a modern chat interface with AI capabilities, file upload functionality, and theme switching.

## Architecture

### Monorepo Structure
- **Root**: Contains scripts for coordinated development
- **client/**: Vue 3 frontend application with Vite
- **server/**: NestJS backend application

### Frontend Architecture (client/)
- **Framework**: Vue 3 + TypeScript + Vite
- **UI Libraries**: Element Plus + Element AI Vue
- **State Management**: Pinia
- **Routing**: Vue Router with nested layout structure
- **Styling**: SCSS with CSS custom properties for theming

### Backend Architecture (server/)
- **Framework**: NestJS + TypeScript
- **Modules**:
  - `ChatModule`: Handles streaming chat API
  - `UploadModule`: Manages file uploads
- **Static Serving**: Serves both client build and uploaded files

### Key Components
- **CommonSender**: Reusable component that encapsulates sender functionality including deep thinking toggle, file upload, and message input
- **Theme Store**: Centralized dark/light theme management
- **MainLayout**: Layout wrapper for all routes

## Development Commands

### Initial Setup
```bash
# Install all dependencies for both client and server
npm run install:all
```

### Development
```bash
# Start both client and server in development mode
npm run dev

# Start only client (runs on Vite dev server with proxy)
npm run dev:client

# Start only server (runs on port 3000)
npm run dev:server
```

### Client-specific Commands
```bash
cd client

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Server-specific Commands
```bash
cd server

# Development with watch mode
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Lint and format
npm run lint
npm run format
```

## API Architecture

### Endpoints
- `POST /api/chat`: Streaming chat endpoint that accepts message, reasoning mode, and attached files
- `POST /api/upload`: File upload endpoint for image files

### Streaming Communication
The chat API uses Server-Sent Events (SSE) for real-time streaming:
- Client uses `@microsoft/fetch-event-source` for robust SSE handling
- Server streams JSON chunks with `reasoning_content` and `content` fields
- Stream ends with `[DONE]` message

## Component Architecture

### CommonSender Component
A highly configurable component that handles:
- Message input with ElASender
- Deep thinking toggle (two UI modes: icon vs button)
- File upload functionality with modal
- Configurable positioning and behavior via props

Key props:
- `fileUploadPosition`: 'prefix' | 'suffix'
- `useButtonWrapper`: boolean (affects accessibility and styling)
- `enableErrorMessage`: boolean (controls ElMessage usage)

### Theme System
- Uses CSS custom properties for consistent theming
- Automatic dark/light class application to document root
- Centralized in Pinia store with reactive DOM updates

## File Upload Flow
1. Client selects files via drag-drop or click
2. Files uploaded to `/api/upload` endpoint
3. Server stores in `uploads/` directory
4. Server returns file metadata (fileId, fileUrl)
5. Files served statically via `/uploads/` route

## Development Proxy Configuration
Vite dev server proxies `/api/*` requests to NestJS server on port 3000, enabling seamless full-stack development.

## Component Patterns

### Event Communication
Components use Vue's emit/props pattern extensively:
- CommonSender emits `update:enableDeepThinking` and `update:uploadedFiles`
- Parent components handle state synchronization

### State Management
- Theme state in Pinia store
- Local component state for UI interactions
- File upload state managed in CommonSender with parent synchronization

### Error Handling
- Dynamic imports for ElMessage to avoid bundle bloat
- Graceful fallbacks for upload failures
- Console logging for debugging

## Styling Conventions
- SCSS with nested selectors
- CSS custom properties for theme variables
- Deep selectors (`:deep()`) for styling third-party components
- Responsive design considerations
- Consistent naming: kebab-case for CSS classes