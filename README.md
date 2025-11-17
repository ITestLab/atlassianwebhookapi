# Atlassian Webhook API

A simple Node.js API endpoint to print and inspect HTTP headers, including token headers.

## Features

- Prints all received HTTP headers to console
- Specifically identifies and highlights token-related headers (authorization, token, auth)
- Supports both GET and POST requests
- Returns headers in JSON format

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

The server will start on port 3000 (or the port specified in the PORT environment variable).

### Endpoints

#### `/headers` (GET/POST/PUT/DELETE/etc.)
Accepts any HTTP method and prints all headers to the console and returns them in the response.

**Example using curl:**

```bash
# Simple GET request
curl http://localhost:3000/headers

# POST request with Authorization header
curl -X POST http://localhost:3000/headers \
  -H "Authorization: Bearer your-token-here" \
  -H "X-Custom-Token: custom-value" \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'
```

**Response format:**
```json
{
  "message": "Headers received successfully",
  "headers": {
    "host": "localhost:3000",
    "authorization": "Bearer your-token-here",
    "x-custom-token": "custom-value",
    ...
  },
  "tokenHeaders": {
    "authorization": "Bearer your-token-here",
    "x-custom-token": "custom-value"
  },
  "timestamp": "2025-11-17T04:26:38.049Z"
}
```

#### `/health` (GET)
Health check endpoint.

```bash
curl http://localhost:3000/health
```

#### `/` (GET)
Returns API information and available endpoints.

```bash
curl http://localhost:3000/
```

## Environment Variables

- `PORT` - Server port (default: 3000)

## License

ISC
