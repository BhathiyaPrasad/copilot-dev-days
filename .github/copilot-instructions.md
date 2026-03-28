# Mona Mayhem — Copilot Instructions

## Project Overview

**Mona Mayhem** is a GitHub Contribution Battle Arena built with Astro v5.

- **Framework**: [Astro 5](https://astro.build/) with server-side rendering
- **Runtime**: Node.js v18+ with [@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/) adapter (`standalone` mode)
- **Language**: TypeScript (strict mode)
- **Architecture**: File-based routing with dynamic API endpoints
- **API**: Fetches GitHub contribution graph data
- **Theme**: Retro arcade (Press Start 2P font)

**Core Structure**:
- `src/pages/index.astro` — Main landing page
- `src/pages/api/contributions/[username].ts` — Dynamic API route that fetches contribution data for a given username
- `public/` — Static assets
- `docs/` — Generated documentation site

## Build & Dev Commands

```bash
npm run dev      # Start Astro dev server (http://localhost:3000)
npm run build    # Build for production → ./dist/
npm run preview  # Preview production build locally
npm run astro    # Run arbitrary Astro CLI commands
```

## Astro Best Practices for This Project

### File-Based Routing
- Pages go in `src/pages/` with `.astro` extension
- API routes use TypeScript: `src/pages/api/route-name.ts`
- Dynamic routes use bracket syntax: `[param].ts`

### Component & Layout Patterns
- Use `.astro` components for page templates and reusable layouts
- Astro components run only on the server; use `<script>` tags for client-side interactivity
- Import client components from `src/components/` if needed (rarely for this project)

### API Routes
- Return JSON responses using `Response` constructor
- Access query params, path params, and request body in the `request` context
- Async functions work naturally in endpoints

### Static vs. Dynamic Content
- Server-side rendering (`output: 'server'`) means pages render on-demand
- For performance, cache external API responses (like GitHub data) when appropriate
- Use `Astro.request` to access HTTP headers and other request context

### TypeScript
- Check `tsconfig.json` — uses `astro/tsconfigs/strict`
- All `.ts` and `.astro` files are type-checked
- Import types with `type` keyword: `import type { MyType } from '...'`

### Common Pitfalls to Avoid
- Don't use client-side frameworks unless necessary (Astro is already reactive)
- API routes must export named function matching the HTTP method: `export const GET = async () => { ... }`
- Remember: `.astro` files render on the server; client interactivity requires explicit `<script>` tags
- Keep `astro.config.mjs` values in sync with environment (Node adapter, `standalone` mode)

## Scope  
These instructions apply to the **production application code** in `src/` and `astro.config.mjs`. 
The `workshop/` directory is educational content and is explicitly excluded from these guidelines.
