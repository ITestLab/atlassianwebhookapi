const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Endpoint to print all headers
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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Atlassian Webhook API is running' });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Atlassian Webhook API',
    endpoints: {
      '/headers': 'POST/GET - Prints all headers including token headers',
      '/health': 'GET - Health check endpoint'
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log(`Headers endpoint: http://localhost:${PORT}/headers`);
});
