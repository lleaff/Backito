var fs = require('fs');

module.exports = function canReadwrite(path) {
    try {
        fs.accessSync(path, fs.R_OK | fs.W_OK);
        return true;
    } catch {
        return false;
    }
};
