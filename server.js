const express = require('express');
const app = express();
const banRoutes = require('./routes/baninfo');

app.use('/', banRoutes);

const port = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
