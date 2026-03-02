#!/usr/bin/env node
// Simple build script: bundle with esbuild, compute content hashes for bundle and CSS,
// write bundle, and update HTML files to include cache-busting query strings ?v=<hash>.

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashContent(buf) {
  return crypto.createHash('md5').update(buf).digest('hex').slice(0, 10);
}

async function build() {
  const outdir = path.join(__dirname, '..', 'assets', 'dist');
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

  // Bundle using esbuild API and write output to disk (outfile).
  // Using outfile/write:true is more reliable across environments than read-back from result.outputFiles.
  const bundlePath = path.join(outdir, 'bundle.js');
  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'assets', 'js', 'main.js')],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: bundlePath,
    // write is true by default when outfile is provided
  });

  if (!fs.existsSync(bundlePath)) {
    throw new Error(`esbuild did not produce ${bundlePath}`);
  }

  const jsBuf = fs.readFileSync(bundlePath);
  const jsHash = hashContent(jsBuf);

  // Hash CSS file (no build step but we can version it)
  const cssPath = path.join(__dirname, '..', 'assets', 'css', 'style.css');
  let cssHash = '';
  if (fs.existsSync(cssPath)) {
    const cssBuf = fs.readFileSync(cssPath);
    cssHash = hashContent(cssBuf);
  }

  // Update HTML files to include ?v=<hash> on bundle and CSS references
  const root = path.join(__dirname, '..');
  const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
  for (const file of htmlFiles) {
    const p = path.join(root, file);
    let content = fs.readFileSync(p, 'utf8');

    // Update bundle.js references
    content = content.replace(/assets\/dist\/bundle\.js(\?v=[a-f0-9]{10})?/g, `assets/dist/bundle.js?v=${jsHash}`);

    // Update CSS references
    content = content.replace(/assets\/css\/style\.css(\?v=[a-f0-9]{10})?/g, cssHash ? `assets/css/style.css?v=${cssHash}` : 'assets/css/style.css');

    fs.writeFileSync(p, content, 'utf8');
    console.log('Updated', file);
  }

  // Optionally write a manifest
  const manifest = {
    js: `assets/dist/bundle.js?v=${jsHash}`,
    css: cssHash ? `assets/css/style.css?v=${cssHash}` : 'assets/css/style.css'
  };
  fs.writeFileSync(path.join(outdir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Build complete. JS hash:', jsHash, 'CSS hash:', cssHash);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
