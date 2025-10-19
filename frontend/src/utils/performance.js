/**
 * Performance monitoring utilities for tracking Core Web Vitals
 * Uses the web-vitals library to measure real user performance
 */

// Placeholder for web-vitals integration
// To enable: npm install web-vitals

/**
 * Report performance metrics to analytics endpoint
 * @param {Object} metric - Performance metric from web-vitals
 */
export function reportWebVitals(metric) {
  // In production, send to your analytics endpoint
  if (import.meta.env.PROD) {
    // Example: Send to analytics API
    // fetch('/api/analytics/vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric)
    // });
  } else {
    // In development, log to console
    console.log('[Web Vitals]', metric);
  }
}

/**
 * Initialize web vitals monitoring
 * Uncomment when web-vitals is installed
 */
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // To enable, install web-vitals:
    // npm install web-vitals
    
    // Then uncomment:
    // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
    // getCLS(reportWebVitals);
    // getFID(reportWebVitals);
    // getFCP(reportWebVitals);
    // getLCP(reportWebVitals);
    // getTTFB(reportWebVitals);
    
    console.log('[Performance] Monitoring initialized (placeholder)');
  }
}

/**
 * Custom performance mark for measuring specific operations
 * @param {string} name - Unique identifier for the mark
 */
export function performanceMark(name) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name);
  }
}

/**
 * Measure time between two performance marks
 * @param {string} measureName - Name for the measurement
 * @param {string} startMark - Start mark name
 * @param {string} endMark - End mark name
 * @returns {number|null} Duration in milliseconds
 */
export function performanceMeasure(measureName, startMark, endMark) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      return measure ? measure.duration : null;
    } catch (error) {
      console.warn('[Performance] Measure failed:', error);
      return null;
    }
  }
  return null;
}

/**
 * Get performance navigation timing
 * @returns {Object} Navigation timing metrics
 */
export function getNavigationTiming() {
  if (typeof window !== 'undefined' && window.performance) {
    const timing = performance.getEntriesByType('navigation')[0];
    if (timing) {
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        download: timing.responseEnd - timing.responseStart,
        domInteractive: timing.domInteractive - timing.fetchStart,
        domComplete: timing.domComplete - timing.fetchStart,
        loadComplete: timing.loadEventEnd - timing.fetchStart
      };
    }
  }
  return null;
}

/**
 * Get resource timing for specific resource types
 * @param {string} resourceType - e.g., 'script', 'stylesheet', 'image'
 * @returns {Array} Array of resource timing entries
 */
export function getResourceTiming(resourceType) {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = performance.getEntriesByType('resource');
    return resources
      .filter(resource => {
        const type = resource.initiatorType || '';
        return type.includes(resourceType);
      })
      .map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        cached: resource.transferSize === 0
      }));
  }
  return [];
}

/**
 * Log performance summary to console
 */
export function logPerformanceSummary() {
  if (import.meta.env.DEV) {
    const navigation = getNavigationTiming();
    if (navigation) {
      console.group('📊 Performance Summary');
      console.log('DNS Lookup:', `${navigation.dns.toFixed(2)}ms`);
      console.log('TCP Connection:', `${navigation.tcp.toFixed(2)}ms`);
      console.log('Time to First Byte:', `${navigation.ttfb.toFixed(2)}ms`);
      console.log('Download:', `${navigation.download.toFixed(2)}ms`);
      console.log('DOM Interactive:', `${navigation.domInteractive.toFixed(2)}ms`);
      console.log('DOM Complete:', `${navigation.domComplete.toFixed(2)}ms`);
      console.log('Load Complete:', `${navigation.loadComplete.toFixed(2)}ms`);
      console.groupEnd();
    }

    // Log script resources
    const scripts = getResourceTiming('script');
    if (scripts.length > 0) {
      console.group('📜 Script Resources');
      scripts.forEach(script => {
        const cached = script.cached ? '💾' : '🌐';
        console.log(`${cached} ${script.name.split('/').pop()}:`, `${script.duration.toFixed(2)}ms (${(script.size / 1024).toFixed(2)}KB)`);
      });
      console.groupEnd();
    }
  }
}

// Auto-log performance summary after page load (dev only)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(logPerformanceSummary, 1000);
  });
}
