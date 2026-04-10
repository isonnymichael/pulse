import path from 'path';
import fs from 'fs/promises';
import { fetchPageSpeed, extractResults } from '../utils/pagespeed.js';
import { formatResultsMarkdown, generateOptimizationInstructions } from '../utils/formatter.js';

function showUsageError(message) {
  console.error(`\n✖ Error: ${message}\n`);
  console.error(`Usage:`);
  console.error(`  npx @isonnymichael/pulse optimize --url <url> --api-key <key> [options]\n`);
  console.error(`Required:`);
  console.error(`  -u, --url <url>            URL to analyze`);
  console.error(`  -k, --api-key <key>        Google PageSpeed Insights API key\n`);
  console.error(`Options:`);
  console.error(`  -s, --strategy <strategy>  Analysis strategy: mobile, desktop, or both (default: both)`);
  console.error(`  --categories <list>        Comma-separated: performance,accessibility,best-practices,seo\n`);
  console.error(`Examples:`);
  console.error(`  npx @isonnymichael/pulse optimize --url https://example.com --api-key YOUR_KEY`);
  console.error(`  npx @isonnymichael/pulse optimize --url https://example.com --api-key YOUR_KEY --strategy mobile\n`);
  process.exit(1);
}

export async function optimizeCommand(options) {
  if (!options.url) {
    showUsageError('--url <url> is required.');
  }

  if (!options.apiKey) {
    showUsageError('--api-key <key> is required.');
  }

  // Validate URL
  try {
    new URL(options.url);
  } catch {
    showUsageError(`Invalid URL: "${options.url}"`);
  }

  // Validate strategy
  const validStrategies = ['mobile', 'desktop', 'both'];
  const strategy = options.strategy || 'both';
  if (!validStrategies.includes(strategy)) {
    showUsageError(`Invalid strategy: "${strategy}". Choose from: ${validStrategies.join(', ')}`);
  }

  const strategies = strategy === 'both' ? ['mobile', 'desktop'] : [strategy];

  console.log('\n⚡ Pulse — AI Web Performance Optimizer\n');
  console.log(`Analyzing: ${options.url}`);
  console.log(`Strategy:  ${strategies.join(' + ')}\n`);

  let fullOutput = '';

  for (const strat of strategies) {
    console.log(`Fetching PageSpeed Insights data (${strat})...\n`);

    let response;
    try {
      response = await fetchPageSpeed(options.url, options.apiKey, {
        strategy: strat,
        categories: options.categories,
      });
    } catch (err) {
      console.error(`✖ Failed to fetch PageSpeed data (${strat}): ${err.message}\n`);
      process.exit(1);
    }

    console.log(`Analyzing ${strat} results...\n`);

    let results;
    try {
      results = extractResults(response);
    } catch (err) {
      console.error(`✖ Failed to parse results (${strat}): ${err.message}\n`);
      process.exit(1);
    }

    // Print quick summary to console
    console.log(`${strat.charAt(0).toUpperCase() + strat.slice(1)} Scores:`);
    for (const [, cat] of Object.entries(results.categories)) {
      const bar = getScoreBar(cat.score);
      console.log(`  ${cat.title.padEnd(20)} ${bar} ${cat.score}/100`);
    }
    console.log('');

    if (results.opportunities.length > 0) {
      console.log(`Found ${results.opportunities.length} optimization opportunities.`);
    }
    if (results.diagnostics.length > 0) {
      console.log(`Found ${results.diagnostics.length} diagnostic issues.`);
    }
    console.log('');

    // Build markdown for this strategy
    const markdown = formatResultsMarkdown(results);
    fullOutput += markdown;

    // Only generate optimization instructions once — merge from the worst strategy
    if (strat === strategies[strategies.length - 1]) {
      // If running both, collect combined results for instructions
      if (strategies.length > 1) {
        fullOutput += `---\n\n`;
      }
      const instructions = generateOptimizationInstructions(results);
      fullOutput += instructions;
    } else {
      fullOutput += `---\n\n`;
    }
  }

  // Write to PULSE.md
  const outputPath = path.join(process.cwd(), 'PULSE.md');
  await fs.writeFile(outputPath, fullOutput, 'utf-8');

  console.log('✔ Report written to PULSE.md\n');
  console.log('✨ Open PULSE.md and pass it to your AI agent to apply optimizations.\n');
}

function getScoreBar(score) {
  const filled = Math.round(score / 5);
  const empty = 20 - filled;
  if (score >= 90) return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  if (score >= 50) return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}
