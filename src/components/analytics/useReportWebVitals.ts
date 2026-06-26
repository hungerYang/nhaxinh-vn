'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { trackEvent } from '@/lib/analytics';

export function useReportWebVitals() {
  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      const label = metric.rating === 'good' ? 'good' : metric.rating === 'needs-improvement' ? 'needs_improvement' : 'poor';

      // Report to GA4
      trackEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_rating: label,
        metric_id: metric.id,
        non_interaction: true,
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const color =
          metric.rating === 'good' ? '\x1b[32m' :
          metric.rating === 'needs-improvement' ? '\x1b[33m' : '\x1b[31m';
        console.log(
          `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)} (${metric.rating})`,
          color.replace('\x1b[32m', 'color: green')
            .replace('\x1b[33m', 'color: orange')
            .replace('\x1b[31m', 'color: red')
        );
      }
    };

    // Core Web Vitals
    onCLS(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);

    // Additional metrics
    onFCP(handleMetric);
    onTTFB(handleMetric);
  }, []);
}
