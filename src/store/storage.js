const fs = require('fs-extra');
const path = require('path');
const cfg = require('../config');
const utils = require('../utils');
const R = require('ramda');
const jdiff = require('jdiff-node');

const PATCHEXT = '.patch';
const STORAGEDIR = cfg.storageDir;
const RESTOREDIR = path.join(STORAGEDIR, 'restored');

(function _initStorageDir() {
    [STORAGEDIR, RESTOREDIR]
        .forEach(dir => utils.mkdirp.sync(dir));
})();

// =Entries
//------------------------------------------------------------

function newEntry() {
    var dirname = utils.epoch();
    fs.mkdirSync(STORAGEDIR+'/'+dirname);
    return dirname;
}

function _entries() {
    return fs.readdirSync(STORAGEDIR).sort();
}

var newestEntry = R.compose(R.last, _entries);
var oldestEntry = R.compose(R.head, _entries);

// =Test entry
//------------------------------------------------------------

function hasPatch(entry, path) {
    path = utils.removeTrailing(path, '/');
    var paths = fs.readdirSync(entry);
    return (paths.indexOf(path+PATCHEXT) !== -1);
}

function hasFile(entry, path) {
    path = utils.removeTrailing(path, '/');
    var paths = fs.readdirSync(entry);
    return (paths.indexOf(path) !== -1);
}

// =History
//------------------------------------------------------------

function getFileHistory(path) {
    var history = _entries()
        .reverse()
        .map(function (entry) {
            if (hasFile(entry, path))
                return path;
            else if (hasPatch(entry, path))
                return patch;
            else
                return null;
        })
        .filter(R.id);
    var patches = history.slice(1);
    return {
        base: history[0],
        hasBase: (history[0] === undefined),
        patches: patches,
        hasPatches: (patches[0] !== undefined)
    };
}

function _getPatches(path) {
    var path = utils.removeTrailing(path, '/');
    return _entries()
        .map(entry => entry+'/'+path+PATCHEXT)
        .filter(utils.canReadwrite);
}

function restoreFile(file, output, callback, errCallback) {
    if (!utils.canReadwrite(STORAGEDIR))
        return utils.error(`Can't find "${path}" in storage.`);
    var history = getFileHistory(path);
    if (!history.hasPatches)
        fs.copy(history.base, output, utils.ifElseErr(callback, errCallback));
    else
        jdiff.patchSeries(history.base, history.patches,
                          output, callback, errCallback);
}

function restore(path, output, callback, errCallback) {
    if (!fs.statSync(path).isDirectory())
        restoreFile(path, output, callback, errCallback);
    else {
        var dirname = path.basename(path);
        fs.mkdir(path.join(output, dirname), errCallback);
        fs.readdir(path, function(err, paths) {
            if (err) {
                console.error('DEBUG: restore: err:', err); //DEBUG
                return errCallback(err);
            }
            utils.map(files, function(file) {
                restoreFile(path.join(path, file),
                            path.join(output, file),
                            (_ => _),
                            errCallback);
                /* TODO: verify that callback is actually called *after*
                   everything is processed */
            }, callback);
        });
    }
}

// =Add
//------------------------------------------------------------

function addNewFile(file, destEntry, callback, errCallback) {
    fs.copy(file, path.join(destEntry, file),
            utils.ifElseErr(callback, errCallback));
}

function updateFile(file, destEntry, callback, errCallback) {
    var restored = path.join(RESTOREDIR, file);
    restore(file, restored, function() {
        jdiff(restored, file, path.join(destEntry, file+PATCHEXT),
              function() {
                  fs.remove(restored);
                  callback.apply(this, arguments);
              }, errCallback);
    }, errCallback);
}

function addFile(file, destEntry, callback, errCallback) {
    var history = getFileHistory(file);
    if (!history.hasBase)
        addNewFile(file, destEntry, callback, errCallback);
    else if (!history.hasPatches)
        jdiff(file, path.join(destEntry, file+PATCHEXT),
              callback, errCallback);
    else
        updateFile(file, destEntry, callback, errCallback);
}

function add(path, destEntry, callback, errCallback) {
    if (!fs.statSync(path).isDirectory())
        addFile(path, destEntry, callback, errCallback);
    else {
        fs.readdir(path, function(err, files) {
            if (err) {
                console.error('DEBUG: restore: err:', err); //DEBUG
                return errCallback(err);
            }
            utils.map(files, function(file) {
                console.log()
                add(path.join(path, file),
                    path.join(destEntry, file),
                    (_ => _),
                    errCallback);
                /* TODO: verify that callback is actually called *after*
                   everything is processed */
            }, callback);
        });
    }
}

// =Export
//------------------------------------------------------------

var basicExport = {
    newestEntry,
    oldestEntry,
    newEntry,
    add,
    restore
};

module.exports = function BackupEntry() {
    Object.assign(this, basicExport);
    this.newestEntry = newestEntry; //DEBUG
    this.oldestEntry = oldestEntry; //DEBUG
    this._getPatches = _getPatches; //DEBUG
    this._entries = _entries; //DEBUG

    this.add = function(path, callback, errCallback) {
        var currEntry = newEntry();
        add(path, currEntry, callback, errCallback);
    }; 

    this.store = function(paths, callback, errCallback) {
        var currEntry = newEntry();
        utils.forEach(paths,
                      path => add(path, currEntry, (_ => _), errCallback),
                      callback);
    }; 
};

Object.assign(module.exports, basicExport);
