const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const root = __dirname;

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const ctype = mime[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': ctype });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  try {
    // Normalize url and strip query
    let urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Redirect explicit .html requests to extensionless path (SEO-friendly / consistent)
    if (urlPath.endsWith('.html')) {
      // map /index.html -> /
      const target = urlPath === '/index.html' ? '/' : urlPath.replace(/\.html$/, '');
      const qs = req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
      res.writeHead(301, { Location: target + qs });
      res.end();
      return;
    }

    // If root, serve index.html
    if (urlPath === '/' || urlPath === '') {
      sendFile(path.join(root, 'index.html'), res);
      return;
    }

    // Prevent directory traversal
    const safeBase = path.normalize(root + path.sep);
    // Attempt candidates in order: exact path, path + .html, path/index.html
    const candidates = [path.join(root, urlPath), path.join(root, urlPath + '.html'), path.join(root, urlPath, 'index.html')];

    // Resolve and check each candidate
    (function tryNext(i) {
      if (i >= candidates.length) {
        // fallback to index.html
        sendFile(path.join(root, 'index.html'), res);
        return;
      }
      const candidate = path.normalize(candidates[i]);
      if (!candidate.startsWith(safeBase)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.access(candidate, fs.constants.R_OK, (err) => {
        if (err) return tryNext(i + 1);
        // found readable file
        sendFile(candidate, res);
      });
    })(0);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
});
