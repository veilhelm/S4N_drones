require('dotenv').config();
const dbConnection = require('./src/config/dbConnection');
dbConnection();
const url = require('url');
const http = require('http');
const fs = require('fs');
const { paths } = require('./src/utils/constants');
const configController = require('./src/controllers/config.controller');
const droneController = require('./src/controllers/drones.controller');
const port = 4000;
const processTextDocsAsInputs = require('./src/adapters/deliveryRoutes.adapter');
const {
  clearDirectory,
  getFilesFromDirectory,
  createZipFileFromDirectory,
} = require('./src/utils/docsHandles');

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

  if (pathname === paths.ROUTES_PATH && method === 'post') {
    if (query.clearPast) clearDirectory('./src/files/out');
    try {
      const cardinalOrders = await processTextDocsAsInputs(req);
      cardinalOrders.forEach((setOfOrders) =>
        droneController.makeSetOfDeliveries(setOfOrders)
      );
      res.writeHead(200, '0k', { 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: 'all orders sent' }));
    } catch (error) {
      res.writeHead(400, 'bad request', { 'content-type': 'application/json' });
      res.end(JSON.stringify(error));
    }
  }

  if (pathname === paths.ROUTES_PATH && method === 'get') {
    if (query.zip) {
      await createZipFileFromDirectory('./src/files/out');
      res.writeHead(200, 'ok', {
        'content-type': 'application/zip',
        'Content-Disposition': `attachment; filename=reports.zip`,
      });
      res.write(fs.readFileSync('./src/files/reports.zip'));
      res.end();
    } else {
      const docs = await getFilesFromDirectory('./src/files/out');
      res.writeHead(200, 'ok', { 'content-type': 'text/plain' });
      docs.forEach((doc) => res.write('\r\n' + doc));
      res.end();
    }
  }

  if (pathname === paths.DRONES_RETURN_PATH && method === 'post') {
    try {
      await droneController.returnHome();
      res.writeHead(200, 'ok');
      res.end(
        JSON.stringify({
          message: 'all drones are back to its originial position',
        })
      );
    } catch (error) {}
  }

  if (pathname === paths.DRONES_PATH && method === 'delete') {
    req.on('end', async () => {
      req.payload = data === '' ? undefined : JSON.parse(data);
      await droneController.deleteDrones(req, res);
    });
  }
});

module.exports = server;
