const fs = require('fs');

module.exports = function isDirectorySync(pth) {
    try {
        fs.statSync(pth).isDirectory();
        return true;
    } catch (e) {
        if (e.code === 'ENOENT')
            return false;
        else
            throw(e);
    }
}
