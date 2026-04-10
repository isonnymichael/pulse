export function scoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟠';
  return '🔴';
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMs(ms) {
  if (!ms) return '';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function cleanDescription(desc) {
  // Remove markdown links like [Learn more](url)
  return desc.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
}

export function formatResultsMarkdown(results) {
  let md = '';

  // Header
  md += `# PageSpeed Insights Report\n\n`;
  md += `- **URL:** ${results.url}\n`;
  md += `- **Strategy:** ${results.strategy}\n`;
  md += `- **Analyzed:** ${results.fetchTime}\n\n`;

  // Category Scores
  md += `## Scores\n\n`;
  md += `| Category | Score |\n`;
  md += `|----------|-------|\n`;
  for (const [, cat] of Object.entries(results.categories)) {
    md += `| ${cat.title} | ${scoreEmoji(cat.score)} **${cat.score}**/100 |\n`;
  }
  md += `\n`;

  // Core Web Vitals / Metrics
  md += `## Core Metrics\n\n`;
  md += `| Metric | Value | Score |\n`;
  md += `|--------|-------|-------|\n`;
  for (const [, metric] of Object.entries(results.metrics)) {
    const s = metric.score !== null ? `${scoreEmoji(metric.score)} ${metric.score}` : 'N/A';
    md += `| ${metric.title} | ${metric.displayValue} | ${s} |\n`;
  }
  md += `\n`;

  // Field Data (CrUX)
  if (Object.keys(results.fieldData).length > 0) {
    md += `## Field Data (Real Users)\n\n`;
    md += `| Metric | Value | Rating |\n`;
    md += `|--------|-------|--------|\n`;
    const fieldLabels = {
      LARGEST_CONTENTFUL_PAINT_MS: 'LCP',
      FIRST_INPUT_DELAY_MS: 'FID',
      CUMULATIVE_LAYOUT_SHIFT_SCORE: 'CLS',
      INTERACTION_TO_NEXT_PAINT: 'INP',
      EXPERIMENTAL_TIME_TO_FIRST_BYTE: 'TTFB',
      FIRST_CONTENTFUL_PAINT_MS: 'FCP',
    };
    for (const [key, data] of Object.entries(results.fieldData)) {
      const label = fieldLabels[key] || key;
      const val = key.includes('SHIFT') ? (data.percentile / 100).toFixed(2) : formatMs(data.percentile);
      md += `| ${label} | ${val} | ${data.category} |\n`;
    }
    md += `\n`;
  }

  // Opportunities
  if (results.opportunities.length > 0) {
    md += `## Opportunities\n\n`;
    md += `These suggestions can help your page load faster. They are sorted by estimated impact.\n\n`;

    for (const opp of results.opportunities) {
      const savings = [];
      if (opp.savingsMs > 0) savings.push(formatMs(opp.savingsMs));
      if (opp.savingsBytes > 0) savings.push(formatBytes(opp.savingsBytes));
      const savingsStr = savings.length > 0 ? ` — Est. savings: ${savings.join(', ')}` : '';

      md += `### ${scoreEmoji(opp.score)} ${opp.title}${savingsStr}\n\n`;
      md += `${cleanDescription(opp.description)}\n\n`;

      if (opp.items.length > 0) {
        const firstItem = opp.items[0];
        const keys = Object.keys(firstItem).filter(k => k !== 'node' && k !== 'subItems');
        if (keys.length > 0) {
          md += `| ${keys.join(' | ')} |\n`;
          md += `| ${keys.map(() => '---').join(' | ')} |\n`;
          for (const item of opp.items) {
            const vals = keys.map(k => {
              const v = item[k];
              if (v && typeof v === 'object' && v.value !== undefined) return String(v.value);
              if (typeof v === 'number') return String(Math.round(v));
              return String(v ?? '');
            });
            md += `| ${vals.join(' | ')} |\n`;
          }
          md += `\n`;
        }
      }
    }
  }

  // Diagnostics
  if (results.diagnostics.length > 0) {
    md += `## Diagnostics\n\n`;
    md += `These items provide additional information about your page's performance.\n\n`;

    for (const diag of results.diagnostics) {
      md += `### ${scoreEmoji(diag.score)} ${diag.title}\n\n`;
      md += `${cleanDescription(diag.description)}\n\n`;
      if (diag.displayValue) {
        md += `**Value:** ${diag.displayValue}\n\n`;
      }
    }
  }

  // Passed audits count
  if (results.passed.length > 0) {
    md += `## Passed Audits (${results.passed.length})\n\n`;
    for (const p of results.passed) {
      md += `- ✅ ${p.title}\n`;
    }
    md += `\n`;
  }

  return md;
}

export function generateOptimizationInstructions(results) {
  let instructions = '';

  instructions += `\n======================================================\n`;
  instructions += `OPTIMIZATION INSTRUCTIONS FOR AI AGENT:\n`;
  instructions += `======================================================\n\n`;

  instructions += `You are an AI web performance optimization agent. Based on the PageSpeed Insights report above, `;
  instructions += `you must now analyze and apply optimizations to the project in the current working directory.\n\n`;

  instructions += `## Analysis Summary\n\n`;
  instructions += `- **URL analyzed:** ${results.url}\n`;
  instructions += `- **Performance score:** ${results.categories.performance?.score ?? 'N/A'}/100\n`;

  const criticalOpps = results.opportunities.filter(o => o.score < 50);
  const moderateOpps = results.opportunities.filter(o => o.score >= 50 && o.score < 90);

  if (criticalOpps.length > 0) {
    instructions += `- **Critical issues (${criticalOpps.length}):** ${criticalOpps.map(o => o.title).join(', ')}\n`;
  }
  if (moderateOpps.length > 0) {
    instructions += `- **Moderate issues (${moderateOpps.length}):** ${moderateOpps.map(o => o.title).join(', ')}\n`;
  }
  instructions += `\n`;

  instructions += `## Required Actions\n\n`;
  instructions += `Scan the project files in the current working directory and apply the following optimizations:\n\n`;

  let actionNum = 1;

  // Generate specific actions based on actual opportunities
  for (const opp of results.opportunities) {
    const actions = getActionsForOpportunity(opp);
    for (const action of actions) {
      instructions += `${actionNum}. **${action.title}**\n`;
      instructions += `   ${action.detail}\n\n`;
      actionNum++;
    }
  }

  // Generate actions based on diagnostics
  for (const diag of results.diagnostics) {
    const actions = getActionsForDiagnostic(diag);
    for (const action of actions) {
      instructions += `${actionNum}. **${action.title}**\n`;
      instructions += `   ${action.detail}\n\n`;
      actionNum++;
    }
  }

  // General best practices if score is low
  if ((results.categories.performance?.score ?? 100) < 90) {
    instructions += `## General Optimization Checklist\n\n`;
    instructions += `- [ ] Verify all images use modern formats (WebP/AVIF) with proper sizing\n`;
    instructions += `- [ ] Ensure critical CSS is inlined and non-critical CSS is deferred\n`;
    instructions += `- [ ] Confirm JavaScript is code-split and lazy-loaded where possible\n`;
    instructions += `- [ ] Check that fonts use \`font-display: swap\` and are preloaded\n`;
    instructions += `- [ ] Validate caching headers are set for static assets\n`;
    instructions += `- [ ] Ensure images have explicit width/height to prevent layout shift\n`;
    instructions += `- [ ] Check for third-party scripts that can be deferred or removed\n`;
  }

  instructions += `\n## Execution Rules\n\n`;
  instructions += `1. Only modify files that exist in the current project directory.\n`;
  instructions += `2. Make each optimization as a focused, minimal change.\n`;
  instructions += `3. Preserve existing functionality — do not break features for performance.\n`;
  instructions += `4. Add code comments explaining each performance optimization.\n`;
  instructions += `5. After applying changes, list what was modified and the expected impact.\n`;
  instructions += `6. Delete PULSE.md file after you are done.\n`;

  instructions += `\n======================================================\n`;

  return instructions;
}

function getActionsForOpportunity(opp) {
  const actions = [];
  const id = opp.id;

  const actionMap = {
    'render-blocking-resources': [{
      title: 'Eliminate render-blocking resources',
      detail: 'Find CSS/JS files in `<head>` that block rendering. Defer non-critical CSS with `media="print" onload="this.media=\'all\'"`. Add `async` or `defer` to non-critical scripts. Inline critical above-the-fold CSS.',
    }],
    'unused-css-rules': [{
      title: 'Remove unused CSS',
      detail: 'Identify and remove CSS rules that are not used on this page. Consider using PurgeCSS or extracting critical CSS. Check for unused CSS framework components.',
    }],
    'unused-javascript': [{
      title: 'Remove unused JavaScript',
      detail: 'Identify JavaScript modules/functions that are imported but not used. Apply tree-shaking, code-split large bundles, and lazy-load non-critical modules.',
    }],
    'modern-image-formats': [{
      title: 'Convert images to modern formats',
      detail: 'Convert JPEG/PNG images to WebP or AVIF format. Use `<picture>` element with fallbacks. Update image references in HTML/CSS.',
    }],
    'offscreen-images': [{
      title: 'Defer offscreen images',
      detail: 'Add `loading="lazy"` attribute to images below the fold. Ensure above-the-fold images are eagerly loaded. Consider using Intersection Observer for custom lazy loading.',
    }],
    'unminified-css': [{
      title: 'Minify CSS files',
      detail: 'Ensure all CSS files are minified in production builds. Add CSS minification to the build pipeline if missing.',
    }],
    'unminified-javascript': [{
      title: 'Minify JavaScript files',
      detail: 'Ensure all JS files are minified in production builds. Add JS minification/terser to the build pipeline if missing.',
    }],
    'uses-responsive-images': [{
      title: 'Properly size images',
      detail: 'Serve images at the correct dimensions for their display size. Use `srcset` and `sizes` attributes. Generate multiple image sizes for responsive layouts.',
    }],
    'efficient-animated-content': [{
      title: 'Use efficient animated content',
      detail: 'Replace GIF animations with video formats (MP4/WebM). Use CSS animations instead of JS-driven animations where possible.',
    }],
    'uses-text-compression': [{
      title: 'Enable text compression',
      detail: 'Enable gzip/Brotli compression on the server for text-based assets (HTML, CSS, JS, SVG). Check server configuration (nginx, Apache, or CDN settings).',
    }],
    'uses-rel-preconnect': [{
      title: 'Preconnect to required origins',
      detail: 'Add `<link rel="preconnect">` for third-party origins used early in page load. Add `<link rel="dns-prefetch">` as fallback.',
    }],
    'server-response-time': [{
      title: 'Reduce server response time (TTFB)',
      detail: 'Investigate server-side performance: database queries, API calls, server config. Consider adding caching layers, CDN, or optimizing backend logic.',
    }],
    'redirects': [{
      title: 'Avoid page redirects',
      detail: 'Eliminate unnecessary HTTP redirects. Update links to point directly to the final URL. Check for redirect chains.',
    }],
    'uses-long-cache-ttl': [{
      title: 'Serve static assets with efficient cache policy',
      detail: 'Set long cache TTL (Cache-Control: max-age=31536000) for static assets with content hashes in filenames. Use shorter TTL for HTML.',
    }],
    'total-byte-weight': [{
      title: 'Reduce total page weight',
      detail: 'The total page size is too large. Compress assets, remove unused code, optimize images, and consider lazy-loading non-critical resources.',
    }],
    'dom-size': [{
      title: 'Reduce DOM size',
      detail: 'The DOM has too many elements. Simplify page structure, virtualize long lists, and lazy-render off-screen content.',
    }],
    'legacy-javascript': [{
      title: 'Remove legacy JavaScript polyfills',
      detail: 'Remove polyfills and transforms for features natively supported by modern browsers. Update browserslist targets. Check for unnecessary Babel transforms.',
    }],
    'duplicated-javascript': [{
      title: 'Remove duplicate JavaScript modules',
      detail: 'Deduplicate JavaScript modules that appear in multiple bundles. Configure bundler to extract common chunks.',
    }],
    'uses-optimized-images': [{
      title: 'Optimize image encoding',
      detail: 'Re-encode images with optimal compression settings. Use quality 80-85 for JPEG, appropriate compression for PNG. Consider using image optimization tools in the build pipeline.',
    }],
  };

  if (actionMap[id]) {
    return actionMap[id];
  }

  // Fallback for unknown opportunities
  actions.push({
    title: opp.title,
    detail: `${cleanDescriptionSimple(opp.description)} ${opp.displayValue ? `Current: ${opp.displayValue}.` : ''}`,
  });

  return actions;
}

function getActionsForDiagnostic(diag) {
  const actions = [];
  const id = diag.id;

  const diagMap = {
    'mainthread-work-breakdown': [{
      title: 'Reduce main-thread work',
      detail: 'Break up long tasks on the main thread. Defer non-critical JavaScript execution. Use web workers for heavy computation. Optimize event handlers.',
    }],
    'bootup-time': [{
      title: 'Reduce JavaScript execution time',
      detail: 'Reduce JS bundle size, defer unused JS, minimize main-thread blocking. Profile with DevTools to find expensive scripts.',
    }],
    'font-display': [{
      title: 'Ensure text remains visible during font load',
      detail: 'Add `font-display: swap` to all @font-face declarations. Preload critical fonts with `<link rel="preload" as="font">`.',
    }],
    'third-party-summary': [{
      title: 'Reduce third-party impact',
      detail: 'Audit third-party scripts for necessity. Defer non-critical third-party scripts. Consider self-hosting critical third-party resources.',
    }],
    'largest-contentful-paint-element': [{
      title: 'Optimize Largest Contentful Paint element',
      detail: 'Identify the LCP element and prioritize its loading. Preload LCP image/resource. Remove render-blocking resources before LCP.',
    }],
    'layout-shifts': [{
      title: 'Avoid large layout shifts',
      detail: 'Add explicit dimensions to images/videos/embeds. Reserve space for dynamic content. Avoid inserting content above existing content.',
    }],
    'long-tasks': [{
      title: 'Break up long tasks',
      detail: 'Split JavaScript execution into smaller chunks using `requestIdleCallback`, `setTimeout`, or `scheduler.yield()`. Avoid synchronous layouts.',
    }],
  };

  if (diagMap[id]) {
    return diagMap[id];
  }

  return actions;
}

function cleanDescriptionSimple(desc) {
  return desc.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
}
