var cfg = require('../config');
var utils = require('../utils');
var storageDir = cfg.storageDir;
var R = require('ramda');
var jdiff = require('jdiff-node');

!function _initStorageDir() {
    if (!utils.canReadwrite(storageDir))
        utils.mkdirp(storageDir);
}();

function _entries() {
    return fs.readdirSync(storageDir).sort();
}

var newest = R.compose(R.last, _entries);
var oldest = R.compose(R.head, _entries);
function _getPatches(path) {
    return _entries().map(entry => entry+'/'+path);
}

function new_entry() {
    var dirname = utils.epoch();
    fs.mkdirSync(storageDir + '/' + dirname);
    return dirname;
}

function restore(path) {
    if (!utils.canReadwrite(storageDir))
        return console.error(`Can't find "${path}" in storage.`);
    var patches = _getPatches(path);
    jdiff.patchSeries();
}

function add(entry, file) {
    
}

var exp = {
    newest,
    oldest,
    new_entry
};

module.exports = exp;
module.exports.init = function () {
    var initialized = {
        newest,
        oldest,
        _getPatches, //DEBUG
        _entries, //DEBUG
    };
    initialized.add = add.bind(new_entry()); 
    return initialized;
};
