const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Serve the favicon with the correct content type
  if (req.url === '/images/fav.ico') {
    res.writeHead(200, { 'Content-Type': 'image/x-icon' });
    fs.createReadStream(path.join(__dirname, 'images', 'fav.ico')).pipe(res);
    return;
  }


  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('File not found');
      return;
    }

    res.writeHead(200, {'Content-Type': contentType});
    res.end(content);
  });
});

const port = 3000;
const ip = '127.0.0.1';
server.listen(port, ip, () => {
  console.log(`Server running at http://${ip}:${port}/`);
});
