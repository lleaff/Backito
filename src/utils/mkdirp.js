var _mkdirp = require('mkdirp');

var _mkdirpSync = _mkdirp.sync;
_mkdirp.sync = function () {
    try {
        _mkdirpSync.apply(_mkdirp, arguments);
    } catch (e) {
        if (e.code !== 'EEXIST' && e.code !== 'ENOTDIR')
            throw e;
    }
};

module.exports = _mkdirp;
