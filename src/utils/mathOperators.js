const valueIsInRange = (value, min, max) => {
  if (value >= min && value <= max) return true;
  else return false;
};

module.exports = {
  valueIsInRange,
};
