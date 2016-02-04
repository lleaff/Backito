var cfg = require('../config');
var utils = require('../utils');

var crypto = require('crypto');
function hashPath(path) {
    return crypto.createHash('md5').update(path).digest('hex');
}

module.exports = require('./storage');
