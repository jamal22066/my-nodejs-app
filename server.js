const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send(`
    <h1>Hello from OpenShift Pipeline! 🚀</h1>
    <p>This app was deployed automatically via Tekton!</p>
    <p>Version: ${process.env.APP_VERSION || '2.0.0'}</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
