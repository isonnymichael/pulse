# Contributing to Pulse

Thank you for your interest in contributing to Pulse! This document outlines the process for contributing and helps you get started quickly.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Commit Convention](#commit-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something useful together.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/isonnymichael/pulse.git
   cd pulse
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Test** your changes:
   ```bash
   node bin/pulse.cjs optimize --url https://example.com --api-key YOUR_KEY
   ```

---

## How to Contribute

### Adding New Audit Mappings

The most impactful contribution is adding optimization instructions for more PageSpeed audits. Here's how:

1. **Open** `src/utils/formatter.js`
2. **Find** the `getActionsForOpportunity()` or `getActionsForDiagnostic()` function
3. **Add** your audit ID and action to the `actionMap` or `diagMap`:

   ```js
   'audit-id': [{
     title: 'Human-readable action title',
     detail: 'Specific steps the AI agent should take to fix this issue.',
   }],
   ```

4. **Test** with a URL that triggers the audit

### Adding New Commands

1. **Create** the command file at `src/commands/<command-name>.js`:

   ```js
   export async function myCommand(options) {
     // Command logic here
   }
   ```

2. **Register** it in `src/index.js`:
   - Import the command
   - Add arg parsing for any new flags
   - Add a `if (command === '<name>') ...` branch

3. **Document** it in the README

### Improving AI Instructions

The `generateOptimizationInstructions()` function in `src/utils/formatter.js` generates the AI agent instructions. Improvements here directly improve optimization quality:

- More specific steps for each audit
- Framework-aware instructions (e.g., Next.js-specific image optimization)
- Better prioritization logic

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description
```

| Type | When to use |
|------|------------|
| `feat` | New feature or audit mapping |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Tooling, deps, config changes |

**Examples:**
```
feat(formatter): add audit mapping for uses-http2
fix(pagespeed): handle missing lighthouse result gracefully
docs(readme): add desktop strategy example
```

---

## Pull Request Guidelines

- Keep PRs **focused** — one feature or fix per PR
- Fill out the PR description with **what** changed and **why**
- Ensure the CLI runs without errors
- Reference any related issues with `Closes #<issue-number>`
- PRs must be reviewed and approved before merging

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/isonnymichael/pulse/issues/new) and include:

- Your OS and Node.js version
- The command you ran (redact your API key)
- The full error output
- Steps to reproduce

---

## Requesting Features

Open a [GitHub Issue](https://github.com/isonnymichael/pulse/issues/new) with:

- What optimization or analysis feature you'd like
- A brief description of the expected behavior
- Any context on why it would be valuable

---

## License

By contributing to Pulse, you agree that your contributions will be licensed under the [GNU General Public License v3.0](./LICENSE).
