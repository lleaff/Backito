module.exports = function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x >>0) === x;
};
