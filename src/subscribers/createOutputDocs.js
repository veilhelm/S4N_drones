const fs = require('fs');
const util = require('util');

const logDeliveries = async (data) => {
  const fileName = `./src/files/out/out${data.serialNumber}.txt`;
  const logData = `\r\n(${data.location['x']}, ${data.location['y']}) dirección ${data.direction}`;
  if (!fs.existsSync(fileName)) {
    fs.writeFileSync(fileName, '==reporte de entregas==');
  }
  fs.appendFileSync(fileName, logData, (err) => {
    console.log(err);
  });
};

const logDeliveryErrors = (data) => {
  const fileName = `./src/files/out/out${data.serialNumber}.txt`;
  fs.writeFileSync(
    fileName,
    `${data.message}\r\nthe dron will prevent any execution until the error is fixed`
  );
};

module.exports = {
  logDeliveries,
  logDeliveryErrors,
};
