# Offline Arcade (single app)

A single TypeScript + WebGPU app with multiple offline-capable pages.

## Current pages
- `/`: Arcade launcher
- `/flappy/`: Flappy Bird (WebGPU)

## Stack
- Vite 6
- TypeScript 5.7
- WebGPU rendering via shared package
- Service worker for offline shell + runtime caching

## Workspace layout
- `apps/arcade`: one app with multiple pages
- `packages/game-catalog`: game metadata for the launcher
- `packages/webgpu-kit`: shared low-level WebGPU renderer

## Local development
```bash
pnpm install
pnpm dev
```

## Build
```bash
pnpm build
pnpm preview
```

## Scaling strategy (same domain)
- Keep all game pages inside `apps/arcade/*/index.html` (e.g. `/breakout/`, `/racer/`)
- Add shared systems in `packages/` (saves, input, UI HUD, audio)
- Register new pages in `packages/game-catalog/src/index.ts`
- Include new route shells in `apps/arcade/sw.js` core cache
