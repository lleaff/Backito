var cargs = require('../args');

module.exports = function debug() {
    if (!cargs.D) { return; }

    var args = Array.prototype.slice.call(arguments);
    args.unshift('DEBUG{');
    args.push('}');
    console.log.apply(console, args);
};
