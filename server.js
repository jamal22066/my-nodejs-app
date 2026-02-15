const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 8080;

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

// Register custom metrics
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

// Middleware to track requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestCounter.inc({ 
      method: req.method, 
      route: req.path, 
      status: res.statusCode 
    });
    httpRequestDuration.observe(
      { method: req.method, route: req.path, status: res.statusCode },
      duration
    );
  });
  
  next();
});

// Main route
app.get('/', (req, res) => {
  res.send(`
    <h1>Hello from OpenShift Pipeline! 🚀</h1>
    <p>This app was deployed automatically via Tekton!</p>
    <p>Version: 3.0.0 - Now with Monitoring!</p>
    <p><a href="/metrics">View Metrics</a> | <a href="/health">Health Check</a></p>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
