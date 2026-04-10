import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { optimizeCommand } from './commands/optimize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {};
  let command = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--version' || arg === '-V') {
      console.log(version);
      process.exit(0);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-') && !command) {
      command = arg;
    } else if ((arg === '--url' || arg === '-u') && args[i + 1]) {
      options.url = args[++i];
    } else if ((arg === '--api-key' || arg === '-k') && args[i + 1]) {
      options.apiKey = args[++i];
    } else if ((arg === '--strategy' || arg === '-s') && args[i + 1]) {
      options.strategy = args[++i];
    } else if (arg === '--categories' && args[i + 1]) {
      options.categories = args[++i].split(',');
    }
  }

  return { command, options };
}

function printHelp() {
  console.log(`Usage: pulse <command> [options]

AI-layer web performance optimization using PageSpeed Insights

Commands:
  optimize   Analyze a URL with PageSpeed Insights and generate optimization instructions

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Run \`pulse optimize --help\` for command-specific help.
`);
}

export async function main() {
  const { command, options } = parseArgs(process.argv);

  if (!command) {
    printHelp();
    process.exit(0);
  }

  if (command === 'optimize') {
    await optimizeCommand(options);
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}
