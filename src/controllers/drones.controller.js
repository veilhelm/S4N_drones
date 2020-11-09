const EventEmiter = require('events');
const Drone = require('../models/drones.model');
const { valueIsInRange } = require('../utils/mathOperators');

class DroneController extends EventEmiter {
  createDrone = async (parameters = {}) => {
    try {
      const drone = await new Drone(parameters);
      const response = await drone.save();
      this.emit('droneCreated');
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  deleteDrones = async (req, res) => {
    const deleteParam = {};
    if (req.payload) deleteParam['_id'] = { $in: req.payload.ids };
    try {
      const response = await Drone.deleteMany(deleteParam);
      res.writeHead(200, 'OK', { 'content-Type': 'Application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.dir(error);
    }
  };

  makeDelivery = async (drone, path) => {
    path.forEach((move) => {
      if (Object.keys(move)[0] === 'y') drone.location['y'] += move['y'];
      if (Object.keys(move)[0] === 'x') drone.location['x'] += move['x'];
    });
    if (
      !valueIsInRange(drone.location['x'], 0, 20) ||
      !valueIsInRange(drone.location['y'], 0, 20)
    ) {
      return this.emit('deliveryError', {
        serialNumber: drone.serialNumber,
        message: 'the address that you are tryng to reach is out of range',
      });
    }
    return this.emit('successfulDelivery', {
      serialNumber: drone.serialNumber,
      location: drone.location,
    });
  };

  makeSetOfDeliveries = async (orders) => {
    const drone = await Drone.findById(orders._id);
    if (typeof orders.paths === 'string')
      return this.emit('deliveryError', {
        serialNumber: drone.serialNumber,
        message: orders.paths,
      });
    if (orders.paths.length > drone.availableLoad) {
      return this.emit('deliveryError', {
        serialNumber: drone.serialNumber,
        message: 'the number of orders exceed the drone capacity',
      });
    }
    orders.paths.forEach(async (path) => this.makeDelivery(drone, path));
  };
}

const droneController = new DroneController();
droneController.on('droneCreated', () => console.log('a drone was created'));
droneController.on('deliveryError', (error) =>
  console.log(error.serialNumber, error.message)
);
droneController.on('successfulDelivery', (data) =>
  console.log(data.serialNumber, data.location)
);
module.exports = droneController;
