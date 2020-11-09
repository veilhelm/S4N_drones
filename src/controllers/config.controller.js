const EventEmiter = require('events');
const droneController = require('./drones.controller');
const restaurantController = require('./restaurant.controller');
const fs = require('fs');

class ConfigController extends EventEmiter {
  setUpRestaurantsInitialConfig = async (req, res) => {
    const response = [];
    try {
      await Promise.all(
        req.payload.map(async (pointOfSale) => {
          const restaurant = await restaurantController.createRestaurant(
            pointOfSale
          );
          for (let i = 1; i <= pointOfSale.numberOfDrones; i++) {
            const drone = await droneController.createDrone({
              ...pointOfSale.initialStateOfDrones,
              restaurantId: restaurant._id,
              serialNumber: i < 9 ? `0${i}` : i,
            });
            restaurant.drones.push(drone._id);
          }
          const savedRestaurant = await restaurant.save();
          response.push(savedRestaurant);
        })
      );
      this.emit('initialConfigSet');
      res.writeHead(200, 'OK', { 'content-Type': 'Application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      throw error;
    }
  };
}

const configController = new ConfigController();
configController.on('initialConfigSet', () =>
  console.log('the initial config was set')
);
module.exports = configController;
