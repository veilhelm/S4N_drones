const EventEmiter = require('events');
const Drone = require('../models/drones.model');
const {
  logDeliveryErrors,
  logDeliveries,
} = require('../subscribers/createOutputDocs');
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

  makeDelivery = async (drone, path, index) => {
    path.forEach((move, index) => {
      if (Object.keys(move)[0] === 'y') drone.location['y'] += move['y'];
      if (Object.keys(move)[0] === 'x') drone.location['x'] += move['x'];
    });
    if (
      !valueIsInRange(drone.location['x'], 0, 20) ||
      !valueIsInRange(drone.location['y'], 0, 20)
    ) {
      return this.emit('deliveryError', {
        serialNumber: drone.serialNumber,
        message: `the address at line ${index} is out of range`,
      });
    }

    const newDirection = this.calcFinalDirectionAfterMoves(
      path[path.length - 1]
    );
    await logDeliveries({
      serialNumber: drone.serialNumber,
      location: drone.location,
      direction: newDirection.string,
    });
    await drone.updateOne({
      location: drone.location,
      direction: newDirection.number,
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
    orders.paths.forEach(
      async (path, index) => await this.makeDelivery(drone, path, index)
    );
  };

  calcFinalDirectionAfterMoves = (lastMove) => {
    if (lastMove['x'] > 0) return { string: 'oriente', number: 0 };
    if (lastMove['x'] < 0) return { string: 'occidente', number: 180 };
    if (lastMove['y'] > 0) return { string: 'norte', number: 90 };
    if (lastMove['y'] < 0) return { string: 'sur', number: 270 };
  };

  returnHome = async (droneId = {}) => {
    const drones = await Drone.find(droneId);
    Promise.all(
      drones.map(async (drone) => {
        await drone.updateOne({ location: { x: 0, y: 0 }, direction: 90 });
      })
    );
  };
}

const droneController = new DroneController();
droneController.on('droneCreated', () => console.log('a drone was created'));
droneController.on('deliveryError', logDeliveryErrors);
module.exports = droneController;
