const fs = require('fs-extra');const path = require('path');
const cfg = require('../config');
const utils = require('../utils');
const trace = utils.trace;
const R = require('ramda');
const jdiff = require('jdiff-node');

const ENTRYPREFIX = 's_';
const PATCHEXT = '.bak_patch';
const STORAGEDIR = cfg.storageDir;
const RESTOREDIR = ''+path.join(STORAGEDIR, 'restored');
const SUMDIR = '.bak_sums';
const SUMDIRREGEX = new RegExp('\\.bak_sums\/');

const readDirWithPath = function (name, o) {
    utils.debug('readDir:name', name);//DEBUG
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
    fs.mkdirSync(STORAGEDIR+'/'+dirname+'/'+SUMDIR);
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
    const entryPath = ''+path.join(STORAGEDIR, entry);
    var paths = readDirWithPath(entryPath)
        .map(p => path.relative(entryPath, p));
    utils.debug('hasPatch: paths:', paths, '...\n',pth+PATCHEXT); //DEBUG
    return (paths.indexOf(pth+PATCHEXT) !== -1);
}

function hasFile(entry, pth) {
    pth = utils.removeTrailing(pth, '/');
    var dir = ''+path.join(STORAGEDIR, ''+entry);
    var paths = readDirWithPath(dir)
        .map(pth => ''+path.relative(dir, pth))
        .filter(pth => !SUMDIRREGEX.test(pth));

    utils.debug('paths', paths);
    utils.debug('pth', pth);
    return (paths.indexOf(pth) !== -1);
}

// =History
//------------------------------------------------------------

function getFileHistory(pth) {
    var history = _entries()
        .map(function (entry) {
            if (hasFile(entry, pth))
                return { entry: entry,
                         path: pth,
                         full: ''+path.join(STORAGEDIR, entry, pth) };
            if (hasPatch(entry, pth))
                return { entry: entry,
                         path: pth,
                         full: ''+path.join(STORAGEDIR, entry, pth+PATCHEXT) };
            else
                return null;
        })
        .filter(x => x);
    const newest  = history.length > 2 ?
        history[history.length - 1] : history[0];
    const patches = history.slice(1);
    return trace({
        base: history[0],
        hasBase: (history[0] !== undefined),
        patches: patches,
        hasPatches: (patches[0] !== undefined),
        newest: newest
    }, 'FileHistory');
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
    utils.debug('restoreFile:', file, '\n\toutput:', output);//DEBUG
    if (!history.hasPatches)
        fs.copy(history.base.path, output,
                utils.ifElseErr(callback, errCallback));
    else
        jdiff.patchSeries(history.base.path,
                          history.patches.map(
                              h => ''+path.join(STORAGEDIR, h.entry, h.path+PATCHEXT)),
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
                utils.debug('restore: err:', err); //DEBUG
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

const hashFn = utils.hashSha256;
function hashFile(pth) {
    return hashFn(fs.readFileSync(pth));
}

function hashStoreFile(entry, pth, hash, callback, errCallback) {
    var dest = ''+path.join(STORAGEDIR, entry, SUMDIR, ''+path.dirname(pth));
    utils.mkdirp.sync(dest);
    fs.writeFile(trace(''+path.join(dest, ''+path.basename(pth)), 'writeHash'),
                 hashFile(pth),
                 utils.ifElseErr(callback, errCallback));
    return dest;
}

function storedFileHash(file, entry) {
    utils.debug('storedFileHash: file:',file, '..entry:', entry);//DEBUG
    const pth = ''+path.join(STORAGEDIR, entry, SUMDIR, file);
    return fs.readFileSync(pth).toString();
}

function addNewFile(file, hash, destEntry, callback, errCallback) {
    var done = 0;
    function _callback() {
        if (++done > 2)
            callback.apply(this, arguments);
    }

    fs.copy(file, ''+path.join(STORAGEDIR, destEntry, file),
            utils.ifElseErr(_callback, errCallback));
    hashStoreFile(destEntry, file, hash, _callback, errCallback)
}

function updateFile(history, file, hash, destEntry, callback, errCallback) {
    utils.debug(`updating "${file}"`);//DEBUG
    var done = 0;
    function _callback() {
        if (++done > 2)
            callback.apply(this, arguments);
    }
    var restored = ''+path.join(RESTOREDIR, file);

    if (!history.hasPatches) {
        jdiff.diff(
            history.base.full,
            file,
            ''+path.join(STORAGEDIR, destEntry, file+PATCHEXT),
            _callback, errCallback);
    } else {
        const restoreCallback = function() {
            jdiff.diff(restored,
                       file,
                       ''+path.join(STORAGEDIR, destEntry, file+PATCHEXT),
                       function() {
                           fs.remove(restored);
                           _callback();
                       }, errCallback);
        };
        restore(file, restored, restoreCallback, errCallback);
    }
    hashStoreFile(destEntry, file, hash, _callback, errCallback)
}

function addFile(file, destEntry, callback, errCallback) {
    var history = getFileHistory(file);
    utils.debug('file: <<', file, '>>history', history);//DEBUG

    const currHash = hashFile(file);
    if (!history.hasBase) {
        addNewFile(file, currHash, destEntry, callback, errCallback);
    } else {
        const oldHash = storedFileHash(history.newest.path,
                                       history.newest.entry);
        utils.debug(`oldHash(`,oldHash,')<=>currHash(',currHash,')');//DEBUG
        if (currHash === oldHash) { utils.debug('FILE NOT MODIFIED'); return; }
        utils.debug('FILE CHANGED');//DEBUG
        updateFile(history, file, currHash, destEntry,
                   callback, errCallback);
    }
}

function add(pth, destEntry, callback, errCallback) {
    if (!fs.statSync(pth).isDirectory())
        addFile(pth, destEntry,
                callback, errCallback);
    else {
        utils.mkdirp.sync(''+path.join(STORAGEDIR, pth));
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

    this.restore = function(paths, callback, errCallback) {

    };
};

Object.assign(module.exports, basicExport);
