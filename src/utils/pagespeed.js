import https from 'https';

const API_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export async function fetchPageSpeed(url, apiKey, options = {}) {
  const strategy = options.strategy || 'mobile';
  const categories = options.categories || ['performance', 'accessibility', 'best-practices', 'seo'];

  const params = new URLSearchParams();
  params.set('url', url);
  params.set('strategy', strategy);
  params.set('key', apiKey);
  for (const cat of categories) {
    params.append('category', cat);
  }

  const requestUrl = `${API_BASE}?${params.toString()}`;

  return new Promise((resolve, reject) => {
    https.get(requestUrl, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          try {
            const err = JSON.parse(data);
            reject(new Error(err.error?.message || `API returned status ${res.statusCode}`));
          } catch {
            reject(new Error(`API returned status ${res.statusCode}`));
          }
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Failed to parse API response'));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

export function extractResults(response) {
  const lr = response.lighthouseResult;
  if (!lr) throw new Error('No lighthouse result in API response');

  const categories = {};
  for (const [id, cat] of Object.entries(lr.categories || {})) {
    categories[id] = {
      title: cat.title,
      score: Math.round((cat.score || 0) * 100),
    };
  }

  const metrics = {};
  const metricIds = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
    'interactive',
  ];
  for (const id of metricIds) {
    const audit = lr.audits[id];
    if (audit) {
      metrics[id] = {
        title: audit.title,
        displayValue: audit.displayValue || '',
        score: audit.score !== null ? Math.round(audit.score * 100) : null,
        numericValue: audit.numericValue,
      };
    }
  }

  const opportunities = [];
  const diagnostics = [];
  const passed = [];

  const perfRefs = lr.categories?.performance?.auditRefs || [];
  for (const ref of perfRefs) {
    const audit = lr.audits[ref.id];
    if (!audit) continue;

    if (ref.group === 'load-opportunities' && audit.score !== null && audit.score < 1) {
      opportunities.push({
        id: ref.id,
        title: audit.title,
        description: audit.description,
        displayValue: audit.displayValue || '',
        score: Math.round(audit.score * 100),
        savingsMs: audit.details?.overallSavingsMs || 0,
        savingsBytes: audit.details?.overallSavingsBytes || 0,
        items: (audit.details?.items || []).slice(0, 5),
      });
    } else if (ref.group === 'diagnostics' && audit.score !== null && audit.score < 1) {
      diagnostics.push({
        id: ref.id,
        title: audit.title,
        description: audit.description,
        displayValue: audit.displayValue || '',
        score: Math.round(audit.score * 100),
        items: (audit.details?.items || []).slice(0, 5),
      });
    } else if (audit.score === 1 && ref.group) {
      passed.push({ title: audit.title });
    }
  }

  // Sort opportunities by savings (highest first)
  opportunities.sort((a, b) => b.savingsMs - a.savingsMs);

  // Extract field data (CrUX) if available
  const fieldData = {};
  const crux = response.loadingExperience;
  if (crux?.metrics) {
    for (const [key, val] of Object.entries(crux.metrics)) {
      fieldData[key] = {
        percentile: val.percentile,
        category: val.category,
      };
    }
  }

  return {
    url: lr.finalUrl || lr.requestedUrl,
    fetchTime: lr.fetchTime,
    strategy: lr.configSettings?.formFactor || 'unknown',
    categories,
    metrics,
    opportunities,
    diagnostics,
    passed,
    fieldData,
  };
}
