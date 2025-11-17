const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const app = express();

// Secret key for signature validation
const SECRET_KEY = process.env.WEBHOOK_SECRET || 'your-secret-key';

// Middleware to parse JSON bodies and capture raw body for signature validation
app.use(bodyParser.json({
  verify: (req, _, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Middleware to parse URL-encoded bodies and capture raw body for signature validation
app.use(bodyParser.urlencoded({
  extended: true,
  verify: (req, _, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Middleware to validate x-hub-signature
const validateWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature'];

  if (!signature) {
    return res.status(401).json({
      error: 'Missing x-hub-signature header'
    });
  }

  // Extract the signature algorithm and hash
  const [algorithm, hash] = signature.split('=');

  // List of supported HMAC algorithms
  const supportedAlgorithms = crypto.getHashes().filter(a => a.startsWith('sha') || a.startsWith('md'));

  if (!algorithm || !hash) {
    return res.status(400).json({
      error: 'Invalid signature format. Expected: algorithm=hash',
      received_signature: signature
    });
  }

  if (!supportedAlgorithms.includes(algorithm)) {
    return res.status(400).json({
      error: `Unsupported signature algorithm: ${algorithm}`,
      supported_algorithms: supportedAlgorithms
    });
  }

  // Compute the expected signature using the raw body
  const hmac = crypto.createHmac(algorithm, SECRET_KEY);
  hmac.update(req.rawBody || '');
  const computedHash = hmac.digest('hex');

    // Log hash comparison
    console.log(`hash === computedHash: ${hash} === ${computedHash} => ${hash === computedHash}`);

  // Compare signatures
  if (hash !== computedHash) {
    return res.status(401).json({
      error: 'Signature validation failed',
      expected: `${algorithm}=${computedHash}`,
      received: signature
    });
  }

  // Signature is valid, proceed
  next();
};

// Webhook endpoint with signature validation
app.post('/webhook', validateWebhookSignature, (req, res) => {
  // Log incoming headers
  console.log('=== Webhook Request Headers ===');
  console.log(JSON.stringify(req.headers, null, 2));
  
  // Log the signature header
  const signatureHeader = req.headers['x-hub-signature'];
  console.log('=== Converted Signature to String ===');
  console.log(signatureHeader);
  
  res.json({
    message: 'Webhook signature validated successfully',
    body: req.body,
    signature_status: 'valid',
    timestamp: new Date().toISOString()
  });
});

// Endpoint to print all headers (no signature validation)
app.all('/headers', (req, res) => {
  // Collect all headers
  const headers = req.headers;
  
  // Log headers to console
  console.log('=== Received Headers ===');
  console.log(JSON.stringify(headers, null, 2));
  
  // Extract token-related headers specifically
  const tokenHeaders = {};
  Object.keys(headers).forEach(key => {
    if (key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('authorization') ||
        key.toLowerCase().includes('auth')) {
      tokenHeaders[key] = headers[key];
    }
  });
  
  // Log token headers separately
  if (Object.keys(tokenHeaders).length > 0) {
    console.log('=== Token Headers ===');
    console.log(JSON.stringify(tokenHeaders, null, 2));
  }
  
  // Send response with headers
  res.json({
    message: 'Headers received successfully',
    headers: headers,
    tokenHeaders: tokenHeaders,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'Atlassian Webhook API is running' });
});
// Default route
// Default route
app.get('/', (_, res) => {
  res.json({
    message: 'Atlassian Webhook API',
    endpoints: {
      '/webhook': 'POST - Validate webhook with x-hub-signature (sha256)',
      '/headers': 'POST/GET - Prints all headers including token headers',
      '/health': 'GET - Health check endpoint'
    },
    signature_format: 'x-hub-signature: sha256=<hex_hash>',
    note: 'Set WEBHOOK_SECRET environment variable for signature validation'
  });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`Headers endpoint: http://localhost:${PORT}/headers`);
});
