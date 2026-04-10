<h1 align="center">⚡ Pulse</h1>

<p align="center">
  <strong>One command. AI-powered web performance optimization.</strong>
</p>

<p align="center">
  Analyze any URL with PageSpeed Insights and let your AI agent apply the fixes — automatically.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@isonnymichael/pulse?style=flat-square&color=3b82f6" alt="npm version">
  <img src="https://img.shields.io/npm/dm/@isonnymichael/pulse?style=flat-square&color=3b82f6" alt="npm downloads">
  <img src="https://img.shields.io/github/stars/isonnymichael/pulse?style=flat-square&color=3b82f6" alt="Stars">
  <img src="https://img.shields.io/github/license/isonnymichael/pulse?style=flat-square&color=3b82f6" alt="License">
  <img src="https://img.shields.io/github/issues/isonnymichael/pulse?style=flat-square&color=ef4444" alt="Issues">
  <a href="https://github.com/sponsors/isonnymichael"><img src="https://img.shields.io/badge/sponsor-♥-ea4aaa?style=flat-square" alt="Sponsor"></a>
</p>

<p align="center">
  <a href="#the-problem">Why Pulse</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## The Problem

You know your site is slow. PageSpeed Insights tells you *what's wrong* — but you still have to manually track down every render-blocking script, every oversized image, every missing cache header, and fix them one by one.

**Pulse closes the loop.** It fetches the PageSpeed report, formats it as structured markdown, and generates targeted optimization instructions — so your AI agent can read the diagnosis and apply the fixes directly in your codebase.

---

## ✨ Features

- **Real PageSpeed data** — Fetches live Lighthouse scores, Core Web Vitals, opportunities, and diagnostics via the PageSpeed Insights API v5
- **Structured markdown report** — Scores, metrics, field data (CrUX), opportunities sorted by impact, diagnostics, and passed audits
- **AI-ready optimization plan** — Generates specific, actionable instructions mapped to 20+ performance patterns
- **Zero dependencies** — Pure Node.js, no external packages
- **Works with any AI agent** — Claude Code, Cursor, Trae, Antigravity, or any tool that can read files
- **Mobile & Desktop** — Analyze either strategy with a single flag

---

## 🚀 Getting Started

**Requirements:**
- Node.js 18+
- A Google PageSpeed Insights API key ([get one free](https://developers.google.com/speed/docs/insights/v5/get-started#APIKey))

Pulse is designed to be invoked through your AI agent chat. The agent runs the command, reads the output, and applies optimizations to your project automatically.

---

## 📖 Usage

**Step 1 — Open your AI agent chat** (Claude Code, Cursor, Trae, Antigravity, etc.)

**Step 2 — Paste this prompt:**

```
Run `npx @isonnymichael/pulse optimize --url https://example.com --api-key YOUR_API_KEY` and execute the results
```

**Step 3 — Done.** The agent reads the report and applies performance optimizations to your project.

---

**Flags:**

| Flag | Required | Description |
|------|----------|-------------|
| `-u, --url <url>` | Yes | The URL to analyze |
| `-k, --api-key <key>` | Yes | Google PageSpeed Insights API key |
| `-s, --strategy <strategy>` | No | `mobile` (default) or `desktop` |
| `--categories <list>` | No | Comma-separated: `performance,accessibility,best-practices,seo` |

---

### Examples

#### Basic (mobile, all categories)

```
Run `npx @isonnymichael/pulse optimize --url https://mysite.com --api-key AIza...` and execute the results
```

#### Desktop analysis

```
Run `npx @isonnymichael/pulse optimize --url https://mysite.com --api-key AIza... --strategy desktop` and execute the results
```

#### Performance only

```
Run `npx @isonnymichael/pulse optimize --url https://mysite.com --api-key AIza... --categories performance` and execute the results
```

---

## ⚙️ How It Works

1. **Fetches** — Calls the PageSpeed Insights API v5 with your URL and API key
2. **Analyzes** — Extracts scores, Core Web Vitals, opportunities (sorted by impact), diagnostics, and field data
3. **Formats** — Generates a structured markdown report with tables, scores, and details
4. **Instructs** — Appends AI optimization instructions mapped to each detected issue (20+ patterns)
5. **Writes** — Saves everything to `PULSE.md` in your project root
6. **Executes** — Your AI agent reads `PULSE.md` and applies the fixes to your codebase

### What the AI Agent Does

Based on the report, the AI agent will:

- Eliminate render-blocking CSS/JS
- Convert images to modern formats (WebP/AVIF)
- Add lazy loading to offscreen images
- Remove unused CSS and JavaScript
- Enable text compression
- Optimize font loading with `font-display: swap`
- Reduce main-thread work
- Add preconnect hints for third-party origins
- Set efficient cache policies
- Fix layout shift issues
- And more — each action is mapped to a specific PageSpeed audit

---

## 📊 Report Structure

The generated `PULSE.md` contains:

| Section | Description |
|---------|-------------|
| **Scores** | Performance, Accessibility, Best Practices, SEO scores with visual indicators |
| **Core Metrics** | FCP, LCP, TBT, CLS, Speed Index, TTI with values and scores |
| **Field Data** | Real-user Chrome UX Report data (LCP, FID, CLS, INP, TTFB) when available |
| **Opportunities** | Actionable suggestions sorted by estimated time savings |
| **Diagnostics** | Additional performance information and warnings |
| **Passed Audits** | What your page already does well |
| **AI Instructions** | Specific optimization tasks for the AI agent to execute |

---

## 📁 Project Structure

```
pulse/
├── bin/
│   └── pulse.cjs              # CLI entrypoint
├── src/
│   ├── index.js               # Argument parser and command router
│   ├── commands/
│   │   └── optimize.js        # `pulse optimize` command logic
│   └── utils/
│       ├── pagespeed.js       # PageSpeed Insights API client
│       └── formatter.js       # Markdown report and AI instruction generator
└── package.json
```

---

## 🔑 Getting an API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **PageSpeed Insights API**
4. Go to **Credentials** and create an API key
5. Use the key with `--api-key`

The API is free with generous rate limits (25,000 queries/day).

---

## 💡 Tips

**Run it on your production URL.**
Analyze the live site, not localhost. PageSpeed Insights needs a publicly accessible URL to measure real-world performance.

**Start with mobile.**
Mobile is the default and usually the more constrained environment. Fix mobile performance first, then check desktop.

**Focus on opportunities with the highest savings.**
The report sorts opportunities by estimated time savings. Tackle the top items first for maximum impact.

**Re-run after applying fixes.**
Run Pulse again after your AI agent applies optimizations to verify improvements and catch remaining issues.

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

The most valuable areas:

- **New optimization patterns** — Add detection and instructions for more PageSpeed audits
- **New commands** — Accessibility-focused analysis, SEO-focused analysis, comparison reports
- **Report improvements** — Better formatting, more detail extraction, trend tracking
- **Bug fixes** — Open an issue first if you're unsure

---

## 🛠️ Development

```bash
git clone https://github.com/isonnymichael/pulse.git
cd pulse
npm install

# Test locally
node bin/pulse.cjs optimize --url https://example.com --api-key YOUR_KEY
```

---

## 📄 License

GPL-3.0 © Sonny Michael

---

<p align="center">
  If Pulse saved you time, consider giving it a ⭐ — it helps others find it.<br>
  Want to support ongoing development? <a href="https://github.com/sponsors/isonnymichael">Sponsor on GitHub ♥</a>
</p>
