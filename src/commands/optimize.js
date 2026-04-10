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
  console.error(`  -s, --strategy <strategy>  Analysis strategy: mobile (default) or desktop`);
  console.error(`  --categories <list>        Comma-separated: performance,accessibility,best-practices,seo\n`);
  console.error(`Examples:`);
  console.error(`  npx @isonnymichael/pulse optimize --url https://example.com --api-key YOUR_KEY`);
  console.error(`  npx @isonnymichael/pulse optimize --url https://example.com --api-key YOUR_KEY --strategy desktop\n`);
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
  const validStrategies = ['mobile', 'desktop'];
  if (options.strategy && !validStrategies.includes(options.strategy)) {
    showUsageError(`Invalid strategy: "${options.strategy}". Choose from: ${validStrategies.join(', ')}`);
  }

  console.log('\n⚡ Pulse — AI Web Performance Optimizer\n');
  console.log(`Analyzing: ${options.url}`);
  console.log(`Strategy:  ${options.strategy || 'mobile'}\n`);
  console.log('Fetching PageSpeed Insights data...\n');

  let response;
  try {
    response = await fetchPageSpeed(options.url, options.apiKey, {
      strategy: options.strategy,
      categories: options.categories,
    });
  } catch (err) {
    console.error(`✖ Failed to fetch PageSpeed data: ${err.message}\n`);
    process.exit(1);
  }

  console.log('Analyzing results...\n');

  let results;
  try {
    results = extractResults(response);
  } catch (err) {
    console.error(`✖ Failed to parse results: ${err.message}\n`);
    process.exit(1);
  }

  // Print quick summary to console
  console.log('Scores:');
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

  // Build the full output
  const markdown = formatResultsMarkdown(results);
  const instructions = generateOptimizationInstructions(results);
  const output = markdown + instructions;

  // Write to PULSE.md
  const outputPath = path.join(process.cwd(), 'PULSE.md');
  await fs.writeFile(outputPath, output, 'utf-8');

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
