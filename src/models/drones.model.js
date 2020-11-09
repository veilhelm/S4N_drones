const { Schema, model } = require('mongoose');

const DroneSchema = new Schema({
  direction: {
    type: Number,
    required: true,
    default: 90,
  },
  location: {
    type: Schema.Types.Mixed,
    required: true,
    default: {
      x: 0,
      y: 0,
    },
  },
  availableLoad: {
    type: Number,
    required: true,
    default: 3,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const Drone = new model('Drone', DroneSchema);
module.exports = Drone;
