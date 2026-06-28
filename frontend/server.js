/**
 * cPanel Node.js startup — rankage.shop
 * Pre-built .next from deploy-web.zip — do NOT run `npm run build` on server.
 */
const path = require('path');
const fs = require('fs');

process.chdir(__dirname);
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
if (!fs.existsSync(buildIdPath)) {
  console.error(
    'Missing .next/BUILD_ID — upload deploy-web.zip (PC build) and extract here.',
  );
  process.exit(1);
}

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, () => {
      console.log(`> rankage.shop ready on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Next.js prepare() failed:', err);
    process.exit(1);
  });
