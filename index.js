require('dotenv').config();
const dbConnection = require('./src/config/dbConnection');
dbConnection();
const url = require('url');
const appConfig = require('./src/config/App.config.json');
const { paths } = require('./src/utils/constants');
const http = require('http');
const configController = require('./src/controllers/config.controller');
const droneController = require('./src/controllers/drones.controller');
const port = 4000;
const processTextDocsAsInputs = require('./src/adapters/deliveryRoutes.adapter');

const server = http.createServer(async (req, res) => {
  const method = req.method.toLowerCase();
  const { pathname, query } = url.parse(req.url, true);
  let data = '';
  req.on('data', (chunk) => (data += chunk));

  if (pathname === paths.CONFIG_PATH && method === 'post') {
    req.on('end', async () => {
      const { restaurants } = JSON.parse(data);
      req.payload = restaurants;
      await configController.setUpRestaurantsInitialConfig(req, res);
    });
  }

  if (pathname === paths.DRONES_PATH && method === 'delete') {
    req.on('end', async () => {
      req.payload = data === '' ? undefined : JSON.parse(data);
      await droneController.deleteDrones(req, res);
    });
  }

  if (pathname === paths.ROUTES_PATH && method === 'post') {
    const cardinalOrders = await processTextDocsAsInputs(req, res);
    console.log(cardinalOrders);
  }
});

server.listen(port, () => {
  console.log(`Server running at port ${port}/`);
});
