var crypto = require('crypto');
module.exports = function hashPath(path) {
    return crypto.createHash('md5').update(path).digest('hex');
};
