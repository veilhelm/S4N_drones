const transformFilesToStrings = require('../utils/filesToString');
const Drone = require('../models/drones.model');
const { waitFor } = require('wait-for-event');

module.exports = async function processTextDocsAsInputs(req, res) {
  const form = await transformFilesToStrings(req);
  const cardinalOrders = [];
  form.on('endProcessing', async (files) => {
    await Promise.all(
      files.map(async (file) => {
        const { location, direction, _id } = await Drone.findOne({
          serialNumber: file.fileName.slice(2, 4),
        });
        const orders = file.data.split('\r\n');
        const paths = calcPathsForDelivery(location, direction, orders);
        cardinalOrders.push({ _id, paths });
      })
    );
    form.emit('dronesMaped');
  });

  await waitFor('dronesMaped', form);
  return cardinalOrders;
};

const calcPathsForDelivery = (initialPosition, initialDirection, orders) => {
  const paths = [];
  let direction = initialDirection;
  let coordinates = initialPosition;
  for (const order of orders) {
    const processedOrder = order.toUpperCase().trim();
    const path = [];
    for (let i = 0; i < processedOrder.length; i++) {
      if (processedOrder[i] === 'A') {
        switch (true) {
          case direction === 90:
            coordinates.y += 1;
            path.push({ y: 1 });
            break;
          case direction === 180:
            coordinates.x -= 1;
            path.push({ x: -1 });
            break;
          case direction === 270:
            coordinates.y -= 1;
            path.push({ y: -1 });
            break;
          case direction === 0:
            coordinates.x += 1;
            path.push({ x: 1 });
            break;
          default:
            break;
        }
      }
      if (processedOrder[i] === 'I') {
        direction += 90;
        if (direction === 360) direction = 0;
      }
      if (processedOrder[i] === 'D') {
        direction -= 90;
        if (direction < 0) direction = 270;
      }
    }
    paths.push(path);
  }
  return paths;
};
