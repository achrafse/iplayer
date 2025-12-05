/**
 * Simple CORS Proxy Server for IPTV API
 * Run with: node proxy-server.js
 * 
 * This bypasses CORS restrictions during web development
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the target URL from query parameter
  const parsedUrl = url.parse(req.url, true);
  const targetUrl = parsedUrl.query.url;

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing url parameter. Usage: ?url=<encoded_url>' }));
    return;
  }

  console.log(`Proxying: ${targetUrl}`);

  const targetParsed = url.parse(targetUrl);
  const client = targetParsed.protocol === 'https:' ? https : http;

  const proxyReq = client.request(targetUrl, {
    method: req.method,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
    }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });

  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running at http://localhost:${PORT}`);
  console.log(`Usage: http://localhost:${PORT}?url=<encoded_url>`);
  console.log(`\nExample: http://localhost:${PORT}?url=${encodeURIComponent('http://example.com/api')}`);
});
