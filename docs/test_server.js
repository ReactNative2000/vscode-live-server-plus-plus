#!/usr/bin/env node
// Simple test server to accept JSON and form-encoded POSTs at /exec
const http = require('http');
const { parse: parseQS } = require('querystring');

const port = process.env.PORT || 9000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/exec') {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      const ct = (req.headers['content-type'] || '').split(';')[0];
      let body = null;
      try {
        if (ct === 'application/json') body = JSON.parse(raw);
        else if (ct === 'application/x-www-form-urlencoded') body = parseQS(raw);
        else body = raw;
      } catch (err) {
        body = raw;
      }

      console.log('--- Received POST /exec ---');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Body:', body);
      console.log('--------------------------');

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(port, () => console.log(`Test server listening on http://127.0.0.1:${port}/exec`));
