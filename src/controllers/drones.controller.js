const EventEmiter = require('events');
const Drone = require('../models/drones.model');

class DroneController extends EventEmiter {
  createDrone = async (parameters = {}) => {
    try {
      const drone = await new Drone(parameters);
      return await drone.save();
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
}

const droneController = new DroneController();
droneController.on('droneCreated', () => console.log('a drone was created'));
module.exports = droneController;
