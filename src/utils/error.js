var cfg = require('../config');

module.exports = function error(msg) {
    console.error(msg);
    return (false);
};
