const fs = require('fs-extra');const path = require('path');
const cfg = require('../config');
const utils = require('../utils');
const ErrorUserInput = utils.errors.userInput;
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

function rndm(l) {
    return Math.random()*Math.pow(10, l)>>0;
}

function newEntry() {
    var dirname = ''+ENTRYPREFIX+utils.epoch()+rndm(6);
    var num = '';
    while (utils.isDirectorySync(''+path.join(STORAGEDIR, dirname + num)))
        num = Number(num) + 1;
    dirname += num;
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

function entryIsEmpty(entry) {
    return readDirWithPath(''+path.join(STORAGEDIR, entry)).length === 0;
}

function entryNameToNum(entry) {
    if (typeof entry === 'string' &&
        entry.substr(0, ENTRYPREFIX.length) === ENTRYPREFIX)
        return entry.substr(ENTRYPREFIX.length) >>0;
    else
        return entry;
}

function entriesUpTo(entries, rev) {
    rev = 's_' + entryNameToNum(rev);
    for (var i = 0; i < entries.length; i++) {
        if (entries[i] === rev)
            return entries(0, i);
    }
    return false;
}

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

// =Revision
//------------------------------------------------------------

function isParentSymbol(c) {
    return c === '^' || c === '~';
}

function revToFromHeadFormat(rev) {
    const HEAD = 'HEAD';
    if (rev.substr(0, HEAD.length) === HEAD) rev = rev.substr(HEAD.length);
    var back = 0;
    for (var i = 0, n = 0; i < rev.length; i++, n = 0) {
        if (isParentSymbol(rev[i])) {
            if (i + 1 >= rev.length || isParentSymbol(rev[i + 1])) {
                n = 1;
            } else {
                for (i = i + 1; i < rev.length; i++) {
                    if (!isNaN(rev[i]))
                        n = n * 10 + rev[i] >>0;
                    else {
                        i--;
                        break;
                    }
                }
            }
            back += n;
        }
    }
    return back;
}

function filterEntriesByRev(entries, rev) {
    if (rev === undefined) {
        return entries;
    } else if (utils.isInt(rev)) {
        const finalEntry = 's_'+rev;
        entries = entriesUpTo(entries, rev);
        if (entries)
            return entries;
        else
            throw new ErrorUserInput(`Revision ${rev} doesn't exist.`);
    } else {
        rev = revToFromHeadFormat(rev);
        return entries.slice(0, entries.length - rev);
    }
    throw new ErrorUserInput(`Revision format not recognized: "${rev}"`);
}

// =History
//------------------------------------------------------------

function getFileHistory(pth, rev) {
    entries = filterEntriesByRev(_entries(), rev);
    if (!entries) { return false; }
    
    var history = entries
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
    }, `FileHistory(rev:${rev})`, '>>>end');
}

function _getPatches(pth) {
    var pth = utils.removeTrailing(pth, '/');
    return _entries()
        .map(entry => entry+'/'+pth+PATCHEXT)
        .filter(utils.canReadwrite);
}


function transferWithPath(pth, dest, callback, errCallback) {
    utils.debug('transfering...pth[', pth, ']\n\tdest[',dest,']');
    fs.move(dest, dest+'~', moveCallback);
    function moveCallback() {
        fs.copy(pth,
                dest,
                function(err, data) {
                    if (err) {
                        utils.debug('transfering..err:',err);
                        callback();
                    }
                    copyCallback();
                });
    }
    function copyCallback() {
        fs.remove(dest+'~', callback);
    }
}


function patchWithPath(pth, patches, dest, callback, errCallback) {
    utils.debug('patching...pth[', pth, ']\n\tdest[',dest,']');
    jdiff.patchSeries(pth,
                      patches.map(h =>
                        ''+path.join(STORAGEDIR, h.entry, h.path+PATCHEXT)),
                      dest,
                      callback, errCallback);
}

/**
 * @param rev - Optional
 */
function restoreFile(file, output, rev, callback, errCallback) {
    utils.debug('restoreFile: file:', file, '\n\trev: ',rev);//DEBUG
    if (typeof rev === 'function') {
        revCallback = callback; callback = rev; rev = undefined;
    }
    if (!utils.canReadwrite(STORAGEDIR))
        return utils.error(`Can't find "${file}" in storage.`);
    try {
        var history = getFileHistory(file, rev);
    } catch(e) {
        utils.debug('getFileHistory failed: [', e, ']');//DEBUG
        if (e.name == ErrorUserInput.name)
            return (errCallback || utils.error(e.message)) &&
            errCallback(e.message);
    }
    utils.debug('hasPatcheshistory', history);//DEBUG
    utils.debug('restoreFile:', file,
                '\n\toutput:', output,
                '\n\tdest:',dest,
                '\n\trev: .',rev,'. history:', history);//DEBUG
    const dest = ''+path.join(output, file);
    utils.mkdirp(''+path.dirname(dest), utils.ifElseErr(function() {
        if (!history.hasPatches)
            transferWithPath(history.base && history.base.path,
                             dest,
                             callback, errCallback);
        else
            patchWithPath(history.base.path,
                          history.patches,
                          dest,
                          callback, errCallback);
    }), errCallback);
}

/**
 * @param rev - Optional
 */
function restore(pth, output, rev, callback, errCallback) {
    utils.debug('restore: output:', output, ',..revbefore:',rev);//DEBUG
    if (typeof rev === 'function') {
        revCallback = callback; callback = rev; rev = undefined;
    }
    utils.debug('\t..revafter:',rev);//DEBUG
    if (!fs.statSync(pth).isDirectory())
        restoreFile(pth, output, rev, callback, errCallback);
    else {
        utils.forEach(readDirWithPath(pth),
                      function (p, cb) {
                          return restoreFile(p, output, rev, cb);
                      },
                      callback);
    }
}

function restoreFiles(paths, dest, rev, callback, errCallback) {
    utils.debug('RESTOREFILES: rev:', rev);//DEBUG
    if (typeof rev === 'function') {
        revCallback = callback; callback = rev; rev = undefined;
    }
    utils.debug('restoreFiles dest{',dest,'}\npaths:{',paths,'}');//DEBUG
    utils.forEach(paths,
                  (pth, cb) => restore(pth,
                                       ''+path.join(dest),
                                       rev,
                                       cb, errCallback),
                                       callback);
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
        if (++done >= 2)
            callback.apply(this, arguments);
    }

    fs.copy(file, ''+path.join(STORAGEDIR, destEntry, file),
            utils.ifElseErr(_callback, errCallback));
            hashStoreFile(destEntry, file, hash, _callback, errCallback)
}

function updateFile(history, file, hash, destEntry, callback, errCallback) {
    var done = 0;
    function _callback() {
        if (++done >= 2)
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
    const history = getFileHistory(file);

    const currHash = hashFile(file);
    if (!history.hasBase) {
        addNewFile(file, currHash, destEntry, callback, errCallback);
    } else {
        const oldHash = storedFileHash(history.newest.path,
                                       history.newest.entry);
                                       if (currHash === oldHash) {
                                           utils.debug('FILE NOT MODIFIED'); callback(); return;
                                       }
                                       utils.debug('FILE CHANGED');//DEBUG
                                       updateFile(history, file, currHash, destEntry,
                                                  callback, errCallback);
    }
}

function add(pth, destEntry, callback, errCallback) {
    utils.forEach(readDirWithPath(pth),
                  (p, cb) => addFile(p, destEntry, cb),
                      callback);
}

function storeFiles(paths, callback, errCallback) {
    var currEntry = newEntry();

    function storeFileCallback() {
        if (entryIsEmpty(currEntry))
            fs.remove(''+path.join(STORAGEDIR, currEntry),
                      utils.ifElseErr(callback, errCallback));
                      else
                          callback.apply(this, arguments);;
    }

    utils.forEach(paths,
                  (pth, cb) => add(pth, currEntry, cb, errCallback),
                      storeFileCallback);
}; 

// =Export
//------------------------------------------------------------

var basicExport = {
    newestEntry,
    oldestEntry,
    newEntry,
    add,
    restore,
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

    this.store = storeFiles;
    this.restore = restoreFiles;
};

Object.assign(module.exports, basicExport);
