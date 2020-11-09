const { strict } = require('assert');
const { Schema, model } = require('mongoose');

const POSSchema = new Schema({
  perimeterOfService: {
    type: Number,
    required: true,
    default: 10,
  },
  name: {
    type: String,
    required: true,
    default: 'HQ',
  },
  drones: {
    type: [{ type: Schema.Types.ObjectId }],
  },
});

const Pos = new model('Pos', POSSchema);
module.exports = Pos;
