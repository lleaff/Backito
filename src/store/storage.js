const fs = require('fs-extra');const path = require('path');
const cfg = require('../config');
const utils = require('../utils');
const trace = utils.trace;
const R = require('ramda');
const jdiff = require('jdiff-node');

const ENTRYPREFIX = 's_';
const PATCHEXT = '.patch';
const STORAGEDIR = cfg.storageDir;
const RESTOREDIR = ''+path.join(STORAGEDIR, 'restored');

const readDirWithPath = function (name, o) {
    console.log('name', name);//DEBUG
    if (o === undefined) o = {};
    o.type = 'f';
    return utils.find(name, o);
};

(function _initStorageDir() {
    [STORAGEDIR, RESTOREDIR]
        .forEach(dir => utils.mkdirp.sync(dir));
})();

// =Entries
//------------------------------------------------------------

function newEntry() {
    var dirname = ''+ENTRYPREFIX+utils.epoch();
    fs.mkdirSync(STORAGEDIR+'/'+dirname);
    return dirname;
}

function _entries() {
    return fs.readdirSync(STORAGEDIR)
        .filter(m => m.substr(0, ENTRYPREFIX.length) === ENTRYPREFIX)
        .sort();
}

var newestEntry = R.compose(R.last, _entries);
var oldestEntry = R.compose(R.head, _entries);

// =Test entry
//------------------------------------------------------------

function hasPatch(entry, pth) {
    pth = utils.removeTrailing(pth, '/');
    var paths = readDirWithPath(''+path.join(STORAGEDIR, entry));
    return (paths.indexOf(pth+PATCHEXT) !== -1);
}

function hasFile(entry, pth) {
    pth = utils.removeTrailing(pth, '/');
    var dir = ''+path.join(STORAGEDIR, ''+entry);
    var paths = readDirWithPath(dir)
        .map(pth => ''+path.relative(dir, pth));

    utils.debug('paths', paths);
    utils.debug('pth', pth);
    return (paths.indexOf(pth) !== -1);
}

// =History
//------------------------------------------------------------

Object.prototype.trace = function(first) {
    var args = Array.prototype.slice.call(arguments);
    if (first) args.shift();
    args.unshift(this);
    if (first) args.unshift(first);
    console.log.apply(console, args);
    return (this);
}

function getFileHistory(pth) {
    console.log('_entries', _entries());//DEBUG
    var history = _entries()
        .reverse()
        .map(function (entry) {
            if (trace(hasFile(entry, pth), 'hasFile:[', ']'))
                return pth;
            else if (hasPatch(entry, pth))
                return patch;
            else
                return null;
        })
        .filter(x => x);
    var patches = history.slice(1);
    return {
        base: history[0],
        hasBase: (history[0] !== undefined),
        patches: patches,
        hasPatches: (patches[0] !== undefined)
    };
}

function _getPatches(pth) {
    var pth = utils.removeTrailing(pth, '/');
    return _entries()
        .map(entry => entry+'/'+pth+PATCHEXT)
        .filter(utils.canReadwrite);
}

function restoreFile(file, output, callback, errCallback) {
    if (!utils.canReadwrite(STORAGEDIR))
        return utils.error(`Can't find "${file}" in storage.`);
    var history = getFileHistory(file);
    if (!history.hasPatches)
        fs.copy(history.base, output, utils.ifElseErr(callback, errCallback));
    else
        jdiff.patchSeries(history.base, history.patches,
                          output, callback, errCallback);
}

function restore(pth, output, callback, errCallback) {
    if (!fs.statSync(pth).isDirectory())
        restoreFile(pth, output, callback, errCallback);
    else {
        var dirname = ''+path.basename(pth);
        fs.mkdir(''+path.join(output, dirname), errCallback);
        fs.readdir(pth, function(err, paths) {
            if (err) {
                console.error('DEBUG: restore: err:', err); //DEBUG
                return errCallback(err);
            }
            utils.map(files, function(file) {
                restoreFile(''+path.join(pth, file),
                            ''+path.join(output, file),
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
    utils.debug('addNewFile:', file, '  destEntry:', destEntry);//DEBUG
    fs.copy(file, ''+path.join(STORAGEDIR, destEntry, file),
            utils.ifElseErr(callback, errCallback));
}

function updateFile(file, destEntry, callback, errCallback) {
    var restored = ''+path.join(RESTOREDIR, file);
    restore(file, restored, function() {
        jdiff.diff(restored, file, ''+path.join(destEntry, file+PATCHEXT),
              function() {
                  fs.remove(restored);
                  callback.apply(this, arguments);
              }, errCallback);
    }, errCallback);
}

function addFile(file, destEntry, callback, errCallback) {
    var history = getFileHistory(file);
    utils.debug('history', history);//DEBUG
    if (!history.hasBase)
        addNewFile(file, destEntry, callback, errCallback);
    else if (!history.hasPatches)
        jdiff.diff(history.base,
                   trace(file, 'file'), 
                   trace(''+path.join(''+destEntry, file+PATCHEXT), 'dest'),
              callback, errCallback);
    else
        updateFile(file, destEntry, callback, errCallback);
}

function add(pth, destEntry, callback, errCallback) {
    if (!fs.statSync(pth).isDirectory())
        addFile(pth, ''+path.join(STORAGEDIR, destEntry),
                callback, errCallback);
    else {
        utils.mkdirp(''+path.join(STORAGEDIR, pth));
        fs.readdir(pth, function(err, files) {
            if (err) {
                return errCallback(err);
            }
            utils.map(files, function(file) {
                add(''+path.join(pth, file),
                    ''+path.join(destEntry),
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

    this.add = function(pth, callback, errCallback) {
        var currEntry = newEntry();
        add(pth, currEntry, callback, errCallback);
    }; 

    this.store = function(paths, callback, errCallback) {
        var currEntry = newEntry();
        utils.forEach(paths,
                      pth => add(pth, currEntry, (_ => _), errCallback),
                      callback);
    }; 
};

Object.assign(module.exports, basicExport);
