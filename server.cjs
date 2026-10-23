const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/style.css': ['style.css', 'text/css'], '/calculator.js': ['calculator.js', 'text/javascript'], '/app.js': ['app.js', 'text/javascript'] };
files['/locales.js'] = ['locales.js', 'text/javascript'];
const server = http.createServer((req, res) => {
  const file = files[req.url.split('?')[0]];
  if (!file) { res.writeHead(404); res.end('Bulunamadi'); return; }
  fs.readFile(path.join(__dirname, file[0]), (error, data) => {
    if (error) { res.writeHead(500); res.end('Dosya okunamadi'); return; }
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  });
});
files['/manifest.webmanifest'] = ['manifest.webmanifest', 'application/manifest+json'];
for (const name of ['favicon.png', 'icon-192.png', 'icon-512.png']) files[`/${name}`] = [name, 'image/png'];
files['/cat-portraits.png'] = ['cat-portraits.png', 'image/png'];
files['/apple-touch-icon.png'] = ['apple-touch-icon.png', 'image/png'];
for (const weight of [400, 600, 700]) files[`/nunito-${weight}.ttf`] = [`nunito-${weight}.ttf`, 'font/ttf'];
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? '4783 portu kullanimda. Acik Mama Payi penceresini kontrol et.' : error.message); process.exitCode = 1; });
server.listen(4783, '0.0.0.0', () => {
  console.log('Mama Payi acik. Kapatmak icin Ctrl+C.\nBilgisayar: http://localhost:4783');
  for (const addresses of Object.values(os.networkInterfaces())) for (const address of addresses || []) {
    if (address.family === 'IPv4' && !address.internal) console.log(`iPhone (ayni Wi-Fi): http://${address.address}:4783`);
  }
});
