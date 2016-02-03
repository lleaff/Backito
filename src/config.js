var HOME = process.env['HOME'];

var cfg = {};

cfg.storageDir = HOME + '/.backito_store';

cfg.maxHistoryLevels = 10;

module.exports = cfg;
