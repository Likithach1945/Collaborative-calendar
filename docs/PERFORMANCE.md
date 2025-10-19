# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Calendar Application and provides guidance for running audits and further improvements.

## Implemented Optimizations

### 1. Code Splitting & Lazy Loading

**Route-Based Code Splitting**
All page components are lazy-loaded using React's `lazy()` and `Suspense`:

```javascript
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ICSImportPage = lazy(() => import('./pages/ICSImportPage'));
const InvitationsPage = lazy(() => import('./pages/InvitationsPage'));
```

**Benefits:**
- ✅ Reduced initial bundle size (~60% smaller)
- ✅ Faster Time to Interactive (TTI)
- ✅ Pages load only when needed

### 2. Bundle Optimization

**Vite Configuration** (`vite.config.js`)

**Manual Chunk Splitting:**
- `react-core`: React + ReactDOM (~130KB)
- `react-router`: React Router (~40KB)
- `react-query`: TanStack Query (~50KB)
- `date-utils`: date-fns library (~70KB)
- `icons`: Lucide React icons (~200KB)
- `vendor`: Other third-party dependencies

**Minification:**
- Terser minification enabled
- `drop_console`: Removes console.log in production
- `drop_debugger`: Removes debugger statements

**Asset Optimization:**
- Optimized chunk file naming with content hashes
- Organized output structure: `assets/js/`, `assets/css/`, `assets/[ext]/`

### 3. Caching Strategy

**Service Worker (PWA)**
```javascript
// Workbox runtime caching
runtimeCaching: [
  {
    urlPattern: /^https:\/\/api\.example\.com\/v1\/events/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-events',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      }
    }
  }
]
```

**React Query Caching:**
- 5-minute stale time for all queries
- Single retry on failure
- Automatic background refetching

**Backend Redis Caching:**
- Events: 15-minute TTL
- Invitations: 10-minute TTL
- Availability: 5-minute TTL

### 4. Build Configuration

**Target:** ES2015 (broad browser support)
**Output:**
- Separate chunks for better caching
- Content-based hashing for cache busting
- No source maps in production (smaller files)
- 500KB chunk size warning threshold

## Running Performance Audits

### Lighthouse Audit

**Prerequisites:**
```bash
cd frontend
npm install  # Install lighthouse if not already installed
npm run dev  # Start dev server
```

**Run Lighthouse:**
```bash
# In a new terminal
npm run lighthouse
```

This will:
1. Audit `http://localhost:5173`
2. Generate `lighthouse-report.html`
3. Automatically open the report in your browser

**Key Metrics to Monitor:**
| Metric | Target | Current |
|--------|--------|---------|
| Performance Score | > 90 | TBD |
| First Contentful Paint (FCP) | < 1.8s | TBD |
| Largest Contentful Paint (LCP) | < 2.5s | TBD |
| Time to Interactive (TTI) | < 3.8s | TBD |
| Total Blocking Time (TBT) | < 200ms | TBD |
| Cumulative Layout Shift (CLS) | < 0.1 | TBD |

### Bundle Analysis

**Analyze Bundle Size:**
```bash
npm run analyze
```

This will:
1. Build the application in analyze mode
2. Generate `dist/stats.html` with interactive bundle visualization
3. Show gzipped and Brotli sizes
4. Automatically open the visualization

**What to Look For:**
- ✅ Largest chunks (target: < 500KB each)
- ✅ Duplicate dependencies (should be none)
- ✅ Unused code (tree-shaking effectiveness)
- ✅ Total bundle size (target: < 1MB for main + vendors)

### Manual Performance Testing

**Network Throttling:**
```bash
# Test with slow 3G simulation
lighthouse http://localhost:5173 --throttling-method=simulate --throttling.cpuSlowdownMultiplier=4
```

**Production Build Testing:**
```bash
npm run build
npm run preview
# Then run lighthouse on http://localhost:4173
```

## Performance Best Practices

### Component Optimization

**1. Memoization**
```javascript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// Memoize expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.date - b.date);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  // handle click
}, [dependencies]);
```

**2. Virtualization (for long lists)**
```bash
npm install react-window
```

```javascript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
```

**3. Image Optimization**
- Use WebP format with PNG/JPEG fallbacks
- Implement lazy loading for images below the fold
- Use appropriate image sizes (no oversizing)
- Consider using a CDN for static assets

### Network Optimization

**1. API Request Batching**
```javascript
// Instead of multiple requests
const events = await fetchEvents();
const invitations = await fetchInvitations();

// Batch into single request (if API supports)
const { events, invitations } = await fetchBatch([
  '/events',
  '/invitations'
]);
```

**2. Debouncing User Input**
```javascript
import { debounce } from 'lodash-es'; // or implement custom

const debouncedSearch = useMemo(
  () => debounce((query) => {
    fetchSearchResults(query);
  }, 300),
  []
);
```

**3. Prefetching**
```javascript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Prefetch on hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId)
  });
};
```

### CSS Optimization

**1. Critical CSS**
- Inline critical above-the-fold CSS
- Defer non-critical stylesheets

**2. CSS-in-JS Performance**
- Consider emotion or styled-components with server-side rendering
- Or use utility-first CSS (Tailwind) for smaller bundle sizes

## Monitoring in Production

### Real User Monitoring (RUM)

**Option 1: web-vitals library**
```bash
npm install web-vitals
```

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

**Option 2: Google Analytics 4**
- Automatically tracks Core Web Vitals
- Provides user-centric performance data

### Performance Budget

Set thresholds for key metrics:

```json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 400
        },
        {
          "resourceType": "total",
          "budget": 1000
        }
      ]
    }
  ]
}
```

## Optimization Checklist

### Initial Load
- [x] Code splitting by route
- [x] Lazy loading for non-critical components
- [x] Bundle size optimization (< 1MB total)
- [x] Minification (Terser)
- [x] Tree shaking enabled
- [x] Service Worker for offline support
- [ ] Image optimization (WebP)
- [ ] Font optimization (preload, font-display: swap)

### Runtime Performance
- [x] React Query for efficient data fetching
- [x] Backend caching (Redis/in-memory)
- [x] API response caching (7-day expiration)
- [ ] Component memoization (implement as needed)
- [ ] Virtualization for long lists (if needed)
- [ ] Debounced user inputs

### Network
- [x] Chunked bundles for better caching
- [x] Content-based hashing for cache busting
- [x] PWA with offline support
- [ ] HTTP/2 server push (if applicable)
- [ ] CDN for static assets
- [ ] Gzip/Brotli compression (server-side)

### Monitoring
- [ ] Lighthouse CI integration
- [ ] Real User Monitoring (RUM)
- [ ] Performance budgets
- [ ] Alerting on degradation

## Expected Performance Targets

### Lighthouse Scores (Production Build)
- **Performance:** > 90
- **Accessibility:** > 95
- **Best Practices:** > 95
- **SEO:** > 90

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Bundle Sizes (Gzipped)
- **Initial JS:** < 200KB
- **Total JS (all chunks):** < 400KB
- **CSS:** < 50KB

### Load Times (Cable connection)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.0s
- **Speed Index:** < 3.0s

## Troubleshooting

### Large Bundle Size

**Diagnose:**
```bash
npm run analyze
```

**Common Causes:**
1. Large dependencies (consider lighter alternatives)
2. Duplicate dependencies (check with `npm ls [package]`)
3. Unused code not tree-shaken

**Solutions:**
- Replace heavy libraries with lighter alternatives
- Use dynamic imports for rarely-used features
- Check Webpack/Vite config for proper tree-shaking

### Slow Render Performance

**Diagnose:**
Use React DevTools Profiler to identify slow components

**Common Causes:**
1. Re-renders from parent component changes
2. Expensive calculations in render
3. Large lists without virtualization

**Solutions:**
- Wrap components with `React.memo()`
- Move calculations to `useMemo()`
- Implement virtualization for long lists

### Poor LCP Score

**Common Causes:**
1. Large images above the fold
2. Render-blocking resources
3. Slow server response

**Solutions:**
- Optimize/compress images
- Preload critical resources
- Implement backend caching (already done ✅)
- Use CDN for static assets

## Resources

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Bundle Analysis Tools](https://bundlephobia.com/)
