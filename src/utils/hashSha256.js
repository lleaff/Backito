var crypto = require('crypto');
module.exports = function hashPath(path) {
    return crypto.createHash('sha256').update(path).digest('hex');
};
