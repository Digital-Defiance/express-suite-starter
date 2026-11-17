import type { Router } from 'express';

/**
 * Register the unauthenticated liveness probe (GET /api/health) on the API
 * router. The Dockerfile HEALTHCHECK and the API e2e project use it.
 *
 * Ordering note: the route is registered right after the library router is
 * constructed. This file cannot make that independent of the suite: if a
 * future suite release registers its own /health route first, or starts
 * shadowing it, the health spec in the API e2e project
 * (health.spec.ts) fails and flags it.
 *
 * This file is identical in the MERN and BrightStack scaffolding; the starter's
 * unit tests fail if the two copies drift apart.
 */
export function registerHealthRoute(router: Router): void {
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
}
