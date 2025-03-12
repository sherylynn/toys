const express = require('express');
const cors = require('cors');
const routes = require('./routes/network').networkRoutes;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/network', routes);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app, server };