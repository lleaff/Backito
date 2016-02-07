var utils = require('./utils');

var cfg = {};

var HOME = process.env['HOME'];
cfg.HOME = HOME;

var CONFIGFILE = HOME + '/.backito_conf.json';
cfg.CFGFILE = CONFIGFILE;

var userCfg = utils.canReadwrite(CONFIGFILE) ? require(CONFIGFILE) : {};
Object.assign(cfg, userCfg);

cfg.storageDir = HOME + '/.backito_store';
cfg.svnStorage = cfg.storageDir + '/svn';

cfg.maxHistoryLevels = 10;

module.exports = cfg;
