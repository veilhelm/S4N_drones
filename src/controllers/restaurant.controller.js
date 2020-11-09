const EventEmiter = require('events');
const Pos = require('../models/restaurantPOS.model');

class RestaurantController extends EventEmiter {
  createRestaurant = async (parameters = {}) => {
    return await new Pos(parameters);
  };
}

const restaurantController = new RestaurantController();
restaurantController.on('restaurantCreated', () =>
  console.log('a restaurant was created')
);
module.exports = restaurantController;
