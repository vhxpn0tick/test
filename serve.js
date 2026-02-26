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
    // Normalize url
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    // Prevent directory traversal
    const safePath = path.normalize(path.join(root, urlPath));
    if (!safePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // If path is a directory, serve index.html inside it
    fs.stat(safePath, (err, stats) => {
      if (!err && stats.isDirectory()) {
        sendFile(path.join(safePath, 'index.html'), res);
        return;
      }

      // If the file doesn't exist, fallback to index.html (SPA-like)
      fs.access(safePath, fs.constants.R_OK, (err) => {
        if (err) {
          // fallback to index.html
          sendFile(path.join(root, 'index.html'), res);
        } else {
          sendFile(safePath, res);
        }
      });
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
});
