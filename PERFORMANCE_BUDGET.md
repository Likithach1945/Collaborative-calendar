# Performance Budget

## Overview
This document defines performance budgets and optimization targets for the Calendar Application to ensure fast load times and smooth user experience.

## Bundle Size Budgets

### Initial Load (Critical Path)
- **Main Bundle**: < 500 KB (gzipped)
- **Vendor Bundle**: < 300 KB (gzipped)
- **CSS**: < 50 KB (gzipped)
- **Total Initial Load**: < 850 KB (gzipped)

### Lazy-Loaded Routes
- **Per Route Chunk**: < 200 KB (gzipped)

### Static Assets
- **Images**: < 100 KB per image (use WebP/AVIF)
- **Fonts**: < 100 KB total
- **Icons**: SVG preferred, < 5 KB each

## Performance Metrics Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Additional Metrics
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.5s
- **Speed Index**: < 3.0s

## Network Performance

### API Response Times
- **P50**: < 200ms
- **P95**: < 500ms
- **P99**: < 1000ms

### Caching Strategy
- **Static Assets**: Cache for 1 year (immutable)
- **API Responses**: Cache for 5 minutes (stale-while-revalidate)
- **Offline Data**: 7-day window in IndexedDB

## Code Splitting Strategy

### Route-Based Splitting
```javascript
// Implemented via React.lazy()
- /login → LoginPage chunk
- /calendar → CalendarPage chunk
- /settings → SettingsPage chunk
```

### Vendor Splitting
```javascript
// Already configured in vite.config.js
- react + react-dom → vendor chunk
- @tanstack/react-query → query chunk
- date-fns → dates chunk
```

## Optimization Checklist

### Build Time
- [x] Tree-shaking enabled (Vite default)
- [x] Code splitting configured
- [x] Minification enabled (production builds)
- [ ] Image optimization pipeline
- [ ] Font subsetting

### Runtime
- [x] React.lazy() for route splitting
- [x] TanStack Query caching
- [x] Service Worker caching
- [ ] Virtual scrolling for long lists
- [ ] Debounced search inputs

### Network
- [x] HTTP/2 enabled
- [x] CORS properly configured
- [ ] CDN for static assets
- [ ] Response compression (gzip/brotli)

## Monitoring

### Tools
- **Lighthouse CI**: Run on every PR
- **Bundle Analyzer**: Review before releases
- **Sentry**: Track performance in production
- **Web Vitals**: Real User Monitoring

### Budget Enforcement
```javascript
// package.json script (to be added)
"analyze": "vite-bundle-visualizer"

// CI check (to be configured)
- Fail build if bundle > budget
- Generate size comparison vs. main branch
```

## Bundle Analysis Commands

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Check for duplicate dependencies
npx depcheck

# Analyze webpack stats (if using webpack)
npx webpack-bundle-analyzer dist/stats.json
```

## Current Status

### As of Phase 2 Completion
- ✅ Vite code splitting configured
- ✅ Manual chunks for vendor/query/dates
- ✅ Service worker caching
- ✅ TanStack Query stale-time optimization
- ⏳ Image optimization pending
- ⏳ Lighthouse CI integration pending
- ⏳ Production monitoring pending

## Future Optimizations

### Phase 3+ Enhancements
1. Implement virtual scrolling for event lists
2. Add progressive image loading
3. Optimize font loading strategy
4. Implement request coalescing
5. Add resource hints (preconnect, dns-prefetch)
6. Optimize critical CSS extraction
7. Implement adaptive loading based on network

## References
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
