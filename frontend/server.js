/**
 * cPanel Node.js startup — rankage.shop
 * Set as "Application startup file" in Setup Node.js App.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> rankage.shop ready on http://${hostname}:${port}`);
  });
});
