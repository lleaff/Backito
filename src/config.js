var utils = require('./utils');

var HOME = process.env['HOME'];
var CONFIGFILE = HOME + '/.backito';

var cfg = {};

var userCfg = utils.canReadwrite(CONFIGFILE) ? require(CONFIGFILE) : {};
Object.assign(cfg, userCfg);

cfg.storageDir = HOME + '/.backito_store';
cfg.svnStorage = cfg.storageDir + '/svn';

cfg.HOME = HOME;

cfg.maxHistoryLevels = 10;

module.exports = cfg;
