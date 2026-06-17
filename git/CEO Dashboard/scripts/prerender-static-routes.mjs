import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDirName = process.argv[2] || process.env.ONEA_PRERENDER_OUTDIR || 'dist-ready';
const distDir = path.resolve(repoRoot, outDirName);

const PRERENDER_STYLES = `
  <style id="onea-prerender-styles">
    .onea-prerender {
      min-height: 100vh;
      background: #fbfcf6;
      color: #17210b;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .onea-prerender__header {
      border-bottom: 1px solid #d9dbcd;
      background: #ffffff;
    }
    .onea-prerender__header-inner,
    .onea-prerender__content,
    .onea-prerender__footer-inner {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .onea-prerender__header-inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-top: 18px;
      padding-bottom: 18px;
    }
    .onea-prerender__brand {
      color: #d6139f;
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      text-decoration: none;
    }
    .onea-prerender__nav {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      font-size: 0.95rem;
    }
    .onea-prerender__nav a,
    .onea-prerender__footer a,
    .onea-prerender__cta-secondary {
      color: #416900;
      text-decoration: none;
    }
    .onea-prerender__content {
      padding-top: 56px;
      padding-bottom: 56px;
    }
    .onea-prerender__eyebrow {
      color: #d6139f;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      margin: 0 0 18px;
      text-transform: uppercase;
    }
    .onea-prerender__headline {
      font-family: Syne, Inter, system-ui, sans-serif;
      font-size: clamp(2.5rem, 4vw, 4.25rem);
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1.02;
      margin: 0;
      max-width: 860px;
    }
    .onea-prerender__intro {
      color: #4b5540;
      font-size: 1.1rem;
      line-height: 1.75;
      margin: 22px 0 0;
      max-width: 860px;
    }
    .onea-prerender__highlights {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      list-style: none;
      margin: 24px 0 0;
      padding: 0;
    }
    .onea-prerender__highlight {
      background: #f8faf1;
      border: 1px solid #d9dbcd;
      border-radius: 999px;
      color: #31411f;
      font-size: 0.92rem;
      font-weight: 700;
      padding: 10px 16px;
    }
    .onea-prerender__cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 28px;
    }
    .onea-prerender__cta-primary,
    .onea-prerender__cta-secondary {
      border-radius: 999px;
      display: inline-flex;
      font-size: 0.98rem;
      font-weight: 800;
      padding: 14px 22px;
      text-decoration: none;
    }
    .onea-prerender__cta-primary {
      background: #8cc444;
      color: #102000;
    }
    .onea-prerender__cta-secondary {
      background: #ffffff;
      border: 1px solid #d9dbcd;
    }
    .onea-prerender__sections {
      display: grid;
      gap: 18px;
      margin-top: 40px;
    }
    .onea-prerender__section {
      background: #ffffff;
      border: 1px solid #d9dbcd;
      border-radius: 24px;
      padding: 24px;
    }
    .onea-prerender__section h2 {
      font-size: 1.22rem;
      line-height: 1.3;
      margin: 0 0 10px;
    }
    .onea-prerender__section p {
      color: #4b5540;
      line-height: 1.72;
      margin: 0;
    }
    .onea-prerender__section ul {
      color: #31411f;
      line-height: 1.7;
      margin: 14px 0 0;
      padding-left: 20px;
    }
    .onea-prerender__footer {
      border-top: 1px solid #d9dbcd;
      color: #4b5540;
      font-size: 0.92rem;
      padding: 20px 0 32px;
    }
    .onea-prerender__footer-inner {
      display: flex;
      flex-wrap: wrap;
      gap: 14px 18px;
      justify-content: space-between;
    }
    @media (max-width: 768px) {
      .onea-prerender__header-inner,
      .onea-prerender__content,
      .onea-prerender__footer-inner {
        padding-left: 18px;
        padding-right: 18px;
      }
      .onea-prerender__content {
        padding-top: 40px;
        padding-bottom: 40px;
      }
      .onea-prerender__headline {
        font-size: clamp(2rem, 10vw, 3rem);
      }
      .onea-prerender__intro {
        font-size: 1rem;
      }
    }
  </style>`;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function replaceTag(html, tagName, attrName, attrValue, nextValue) {
  const pattern = new RegExp(`<${tagName}[^>]*${attrName}="${attrValue}"[^>]*content="[^"]*"[^>]*>`, 'i');
  if (pattern.test(html)) {
    return html.replace(pattern, `<${tagName} data-rh="true" ${attrName}="${attrValue}" content="${escapeHtml(nextValue)}" />`);
  }
  return html;
}

function replaceTitle(html, title) {
  return html.replace(/<title>.*?<\/title>/i, `<title data-rh="true">${escapeHtml(title)}</title>`);
}

function replaceLinkRel(html, rel, href) {
  const pattern = new RegExp(`<link[^>]*rel="${rel}"[^>]*href="[^"]*"[^>]*>`, 'i');
  if (pattern.test(html)) {
    return html.replace(pattern, `<link data-rh="true" rel="${rel}" href="${escapeHtml(href)}" />`);
  }
  return html;
}

function renderSections(sections = []) {
  if (!sections.length) return '';

  return `
    <section class="onea-prerender__sections" aria-label="Page summary">
      ${sections
        .map(section => `
          <article class="onea-prerender__section">
            <h2>${escapeHtml(section.title)}</h2>
            <p>${escapeHtml(section.body)}</p>
            ${section.items?.length
              ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
              : ''}
          </article>`)
        .join('')}
    </section>`;
}

function renderShell(routePath, shell) {
  const navLinks = [
    ['/', 'Home'],
    ['/solutions', 'Solutions'],
    ['/pricing', 'Pricing'],
    ['/case-studies', 'Case Studies'],
    ['/blog', 'Blog'],
    ['/team', 'Team'],
  ];

  return `
    <div class="onea-prerender" data-onea-prerender="${escapeHtml(routePath)}">
      <header class="onea-prerender__header">
        <div class="onea-prerender__header-inner">
          <a class="onea-prerender__brand" href="/">Onea Africa</a>
          <nav class="onea-prerender__nav" aria-label="Primary">
            ${navLinks.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join('')}
          </nav>
        </div>
      </header>
      <main class="onea-prerender__content">
        <p class="onea-prerender__eyebrow">${escapeHtml(shell.eyebrow)}</p>
        <h1 class="onea-prerender__headline">${escapeHtml(shell.headline)}</h1>
        <p class="onea-prerender__intro">${escapeHtml(shell.intro)}</p>
        ${shell.highlights?.length
          ? `<ul class="onea-prerender__highlights">${shell.highlights.map(item => `<li class="onea-prerender__highlight">${escapeHtml(item)}</li>`).join('')}</ul>`
          : ''}
        ${(shell.primaryCta || shell.secondaryCta)
          ? `<div class="onea-prerender__cta-row">
              ${shell.primaryCta ? `<a class="onea-prerender__cta-primary" href="${shell.primaryCta.href}">${escapeHtml(shell.primaryCta.label)}</a>` : ''}
              ${shell.secondaryCta ? `<a class="onea-prerender__cta-secondary" href="${shell.secondaryCta.href}">${escapeHtml(shell.secondaryCta.label)}</a>` : ''}
            </div>`
          : ''}
        ${renderSections(shell.sections)}
      </main>
      <footer class="onea-prerender__footer">
        <div class="onea-prerender__footer-inner">
          <span>Onea Africa | Pretoria, Gauteng | South Africa</span>
          <span>
            <a href="/privacy">Privacy</a> |
            <a href="/terms">Terms</a> |
            <a href="/client-portal">Client Portal</a>
          </span>
        </div>
      </footer>
    </div>`;
}

function applyMeta(baseHtml, routePath, meta, canonicalUrl, robots, structuredData, shell) {
  let html = baseHtml;
  const isArticle = routePath.startsWith('/blog/') || routePath.startsWith('/case-studies/');
  const metaMarkup = [
    `<meta data-rh="true" name="robots" content="${robots}" />`,
    `<link data-rh="true" rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
  ].join('\n  ');
  const structuredMarkup = structuredData
    .map(entry => `<script data-rh="true" type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join('\n  ');

  html = replaceTitle(html, meta.title);
  html = replaceTag(html, 'meta', 'name', 'description', meta.description);
  html = replaceTag(html, 'meta', 'name', 'keywords', meta.keywords);
  html = replaceTag(html, 'meta', 'property', 'og:type', isArticle ? 'article' : 'website');
  html = replaceTag(html, 'meta', 'property', 'og:url', canonicalUrl);
  html = replaceTag(html, 'meta', 'property', 'og:title', meta.title);
  html = replaceTag(html, 'meta', 'property', 'og:description', meta.description);
  html = replaceTag(html, 'meta', 'name', 'twitter:title', meta.title);
  html = replaceTag(html, 'meta', 'name', 'twitter:description', meta.description);
  html = replaceLinkRel(html, 'manifest', '/manifest.json');

  html = html.replace('<!-- prerender-meta -->', `${metaMarkup}\n  <!-- prerender-meta -->`);
  html = html.replace('<!-- prerender-structured-data -->', `${structuredMarkup}\n  <!-- prerender-structured-data -->`);
  html = html.replace('</head>', `${PRERENDER_STYLES}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${renderShell(routePath, shell)}</div>`);

  return html;
}

function targetFileForRoute(routePath) {
  if (routePath === '/') return path.join(distDir, 'index.html');
  return path.join(distDir, routePath.replace(/^\//, ''), 'index.html');
}

async function loadMetadata() {
  const vite = await createServer({
    root: repoRoot,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true },
  });

  try {
    return await vite.ssrLoadModule('/src/seo/siteMetadata.ts');
  } finally {
    await vite.close();
  }
}

async function main() {
  const baseHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
  const metadata = await loadMetadata();
  const routePaths = metadata.getPrerenderPaths();

  let writtenCount = 0;

  for (const routePath of routePaths) {
    const shell = metadata.getPrerenderShell(routePath);
    if (!shell) continue;

    const outputPath = targetFileForRoute(routePath);
    const html = applyMeta(
      baseHtml,
      routePath,
      metadata.getMeta(routePath),
      metadata.getCanonicalUrl(routePath),
      metadata.shouldNoIndex(routePath) ? 'noindex, nofollow' : 'index, follow',
      metadata.getStructuredData(routePath),
      shell,
    );

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, 'utf8');
    writtenCount += 1;
  }

  console.log(`Pre-rendered ${writtenCount} public routes into ${distDir}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
