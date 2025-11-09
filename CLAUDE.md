# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website/blog built as a monorepo using pnpm workspaces. The project consists of:
- **Frontend**: Next.js 15 application (App Router) with TypeScript, Tailwind CSS, and Framer Motion
- **Backend**: NestJS application (currently minimal/placeholder)

The site showcases personal introduction, projects, and blog posts stored in MySQL, with images served from CloudFront CDN.

## Common Commands

### Development
```bash
# Run both frontend and backend concurrently
pnpm dev

# Run only frontend (most common for development)
pnpm dev:frontend

# Run only backend
pnpm dev:backend
```

### Building
```bash
# Build all packages
pnpm build

# Build specific workspace
pnpm build:frontend
pnpm build:backend
```

### Linting
```bash
# Lint all packages
pnpm lint
```

### Post Management
```bash
# Import markdown posts from src/data/posts/ to MySQL database
# Run from apps/frontend directory
node src/scripts/importPosts.cjs
```

### Testing (Backend)
```bash
# Run from apps/backend directory
pnpm test           # Unit tests
pnpm test:watch     # Watch mode
pnpm test:e2e       # E2E tests
pnpm test:cov       # Coverage report
```

## Architecture

### Monorepo Structure
- `/apps/frontend` - Next.js frontend application
- `/apps/backend` - NestJS backend (minimal, mostly unused currently)
- Root `package.json` contains workspace scripts using pnpm filters

### Frontend Architecture

#### App Router Structure
- **Home page** (`/`): Landing page with introduction
- **Post list** (`/post`): Blog post listing page
- **Post detail** (`/post/[displayId]`): Individual post view using display ID (reverse chronological order number)

#### API Routes
- `GET /api/posts` - Fetches all posts from MySQL, adds `displayId` (reverse chronological numbering)
- `GET /api/posts/[displayId]` - Fetches single post by display ID

#### Database Integration
- Uses `mysql2/promise` for direct MySQL connection (no ORM)
- Connection pool configured via environment variables in `src/lib/db.js`
- Posts table schema: `id`, `title`, `body` (markdown), `created_at`, `updated_at`
- Display IDs are computed: `displayId = total_posts - index` (reverse chronological)

#### Post Content Flow
1. Markdown files placed in `src/data/posts/`
2. Run `importPosts.cjs` script to parse markdown and insert into MySQL
3. Script transforms image paths to CloudFront URLs with format: `https://d1faf0kcj4x8qr.cloudfront.net/posts/{UUID}-{number}.png`
4. Frontend fetches from API routes and renders with `react-markdown` + `remark-gfm`

#### Key Dependencies
- **Styling**: Tailwind CSS with `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Animation**: Framer Motion
- **UI Components**: Radix UI (Dialog), Vaul (drawer), custom UI components in `src/components/ui/`
- **Markdown**: `react-markdown` with `remark-gfm` for GitHub Flavored Markdown
- **Icons**: `lucide-react`, `react-icons`

#### Path Aliases
- `@/*` maps to `src/*` (configured in `tsconfig.json`)

#### Environment Variables
Required in `apps/frontend/.env.local`:
```
DB_HOST=<rds-endpoint>
DB_USER=<username>
DB_PASSWORD=<password>
DB_NAME=<database>
DB_PORT=3306
API_BASE_URL=<base-url-for-ssr-fetch>
```

#### Image Handling
- Next.js Image component configured to allow CloudFront domain: `d1faf0kcj4x8qr.cloudfront.net`
- Images in markdown posts are served from CloudFront CDN
- Import script generates UUID-based image filenames

### Backend Architecture
- Standard NestJS structure with placeholder app module
- Currently not actively used; frontend connects directly to MySQL
- Uses Jest for testing with `ts-jest` transformer

## Development Notes

### Routing
- Post URLs use `displayId` (reverse chronological number) instead of database `id`
- This ensures newest posts have highest numbers (e.g., post #10 is newer than #9)
- Computed server-side in API routes: `displayId = totalPosts - arrayIndex`

### Async Route Params
- Next.js 15 uses Promise-based params: `const { displayId } = await params;`
- This applies to both page components and API route handlers

### Markdown Rendering
- Custom ReactMarkdown components defined in `post/[displayId]/page.tsx`
- Handles code blocks, blockquotes, headings, lists, images with specific styling
- Images rendered with Next.js Image component for optimization

### TypeScript Configuration
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler (Next.js default)

### Git Workflow
- Main branch: `main`
- Current feature branch: `feat/post-nestjs`
- PR template available at `.github/PULL_REQUEST_TEMPLATE.md`
