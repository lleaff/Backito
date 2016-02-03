
var cfg = require('../config');
var utils = require('utils');

var crypto = require('crypto');
function hashPath(path) {
    return crypto.createHash('md5').update(path).digest('hex');
}

var fs = require('fs');
function storeFile(path, storage) {
    utils.canReadwrite(path, function(err) {
        if (!err) {
            
        }
    });
}

module.exports = {};
