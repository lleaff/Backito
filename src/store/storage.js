var cfg = require('../config');
var utils = require('../utils');
var storageDir = cfg.storageDir;

function newest() {
    if (!utils.canReadwrite(storageDir))
        utils.mkdirp(storageDir);
    var folders = fs.readdirSync(storageDir);
    console.log(folders);
}

module.exports = {
    newest
};
